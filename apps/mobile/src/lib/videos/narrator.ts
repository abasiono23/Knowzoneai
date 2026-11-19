import { createAudioPlayer, setAudioModeAsync, type AudioPlayer, type AudioStatus } from 'expo-audio';
import * as Speech from 'expo-speech';
import { Platform } from 'react-native';

import { voiceOf } from './options';

/**
 * Scene narration keeps one audio player for every scene: each scene's track replaces the last one.
 * Making a new player per scene left the voice silent on some devices while the captions ran on.
 * Browsers (Safari above all) only let audio start without a tap on a media element that has already
 * played, and a fresh player started by the video's clock isn't one. On the web that means one <audio>
 * element of our own whose track changes (expo-audio's web player makes a new element on replace).
 */
interface Track {
  /** Plays `audio` from `from` seconds at `speed`. */
  start(audio: string, speed: number, from: number): void;
  pause(): void;
  /** Plays on if the track stopped on its own before its end. */
  resume(): void;
}

/** Narration should be sounding (between speak and stop). */
let active = false;

function webTrack(): Track {
  let el: HTMLAudioElement | null = null;
  let turn = 0;
  return {
    start(audio, speed, from) {
      el ??= new Audio();
      const media = el;
      const mine = ++turn;
      media.preload = 'auto';
      media.src = audio;
      media.playbackRate = speed;
      if (from > 0.2) {
        // Seeking needs the track's length first; a later scene's track mustn't take this seek.
        media.addEventListener(
          'loadedmetadata',
          () => {
            if (mine === turn) media.currentTime = from;
          },
          { once: true },
        );
      }
      media.play().catch(() => {});
    },
    pause() {
      el?.pause();
    },
    resume() {
      if (!el || !el.paused || el.ended || el.readyState < 2) return;
      el.play().catch(() => {});
    },
  };
}

function nativeTrack(): Track {
  let player: AudioPlayer | null = null;
  let finished = false;
  /** Where the current track should start, until it has loaded and started there. */
  let startAt: number | null = null;
  const onStatus = (status: AudioStatus) => {
    if (!player || !active) return;
    if (status.didJustFinish) finished = true;
    // The new track is in: start it at the right moment (a seek before loading can be lost).
    if (startAt !== null && status.isLoaded) {
      const from = startAt;
      startAt = null;
      if (from > 0.2 && Math.abs(status.currentTime - from) > 0.5) player.seekTo(from).catch(() => {});
      if (!status.playing) player.play();
    }
  };
  return {
    start(audio, speed, from) {
      if (!player) {
        player = createAudioPlayer(audio);
        player.addListener('playbackStatusUpdate', onStatus);
      } else {
        player.replace(audio);
      }
      finished = false;
      startAt = from;
      player.setPlaybackRate(speed);
      if (from > 0.2) player.seekTo(from).catch(() => {});
      player.play();
    },
    pause() {
      startAt = null;
      player?.pause();
    },
    resume() {
      const p = player;
      if (!p || finished || p.playing || !p.isLoaded) return;
      if (p.duration > 0 && p.currentTime >= p.duration - 0.3) return;
      p.play();
    },
  };
}

let track: Track | null = null;
let modeSet = false;
const theTrack = () => (track ??= Platform.OS === 'web' ? webTrack() : nativeTrack());

/**
 * Videos made by the server carry a recorded voice track per scene (OpenAI neural voices); it's played
 * from `from` seconds in, at the player's speed. Scenes without a recording are read by the device's
 * text-to-speech (the Web Speech API on web). Failures are silent: captions still carry the content.
 */
export const narrator = {
  speak(text: string, voiceId: string, speed = 1, audio?: string, from = 0) {
    narrator.stop();
    if (audio) {
      try {
        if (!modeSet && Platform.OS !== 'web') {
          modeSet = true;
          // Narration should play even with the phone's ring switch on silent.
          setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
        }
        active = true;
        theTrack().start(audio, speed, from);
      } catch {
        narrator.stop();
      }
      return;
    }
    const v = voiceOf(voiceId);
    try {
      Speech.speak(text, { language: v.language, pitch: v.pitch, rate: Math.min(2, v.rate * speed) });
    } catch {
      // No speech engine available (some browsers, headless): captions carry the content.
    }
  },
  /**
   * Starts the voice again if it stopped on its own before the end of its track: another sound took the
   * audio over, or the device didn't let it start. The video's clock calls this while it runs.
   */
  keepGoing() {
    if (!active || !track) return;
    try {
      track.resume();
    } catch {
      // Captions carry on regardless.
    }
  },
  stop() {
    active = false;
    try {
      track?.pause();
    } catch {
      // Already released.
    }
    try {
      Speech.stop();
    } catch {
      // Ignore, same as above.
    }
  },
};
