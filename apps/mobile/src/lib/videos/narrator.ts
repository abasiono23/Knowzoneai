import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import * as Speech from 'expo-speech';

import { voiceOf } from './options';

let player: AudioPlayer | null = null;
let modeSet = false;

function stopAudio() {
  try {
    player?.pause();
    player?.remove();
  } catch {
    // Already released.
  }
  player = null;
}

/**
 * Scene narration. Videos made by the server carry a recorded voice track per scene (OpenAI
 * neural voices); it's played from `from` seconds in, at the player's speed. Scenes without a
 * recording are read by the device's text-to-speech (the Web Speech API on web). Failures are
 * silent: captions still carry the content.
 */
export const narrator = {
  speak(text: string, voiceId: string, speed = 1, audio?: string, from = 0) {
    narrator.stop();
    if (audio) {
      try {
        if (!modeSet) {
          modeSet = true;
          // Narration should play even with the phone's ring switch on silent.
          setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
        }
        player = createAudioPlayer(audio);
        player.setPlaybackRate(speed);
        if (from > 0.2) player.seekTo(from).catch(() => {});
        player.play();
      } catch {
        stopAudio();
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
  stop() {
    stopAudio();
    try {
      Speech.stop();
    } catch {
      // Ignore, same as above.
    }
  },
};
