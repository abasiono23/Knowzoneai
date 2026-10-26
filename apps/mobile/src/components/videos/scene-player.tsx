import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View, type LayoutChangeEvent } from 'react-native';

import { Text } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { formatNumber } from '@/i18n';
import { narrator } from '@/lib/videos/narrator';
import { styleOf } from '@/lib/videos/options';
import { clock, durationOf, type Video } from '@/lib/videos/types';

import { SceneView } from './scene-view';

const SPEEDS = [1, 1.25, 1.5, 2, 0.75];

const FEED_INSET = { right: 56, bottom: 150 };
/** Keeps scene text above the caption bar and controls. */
const FULL_INSET = { bottom: 110 };

type Props = {
  video: Video;
  active?: boolean;
  startAt?: number;
  controls?: 'full' | 'minimal';
  narration?: boolean;
  onTime?: (t: number) => void;
  onEnded?: () => void;
  /** Override the video's own settings, e.g. while previewing adjustments. */
  styleId?: string;
  captions?: boolean;
};

/**
 * Plays an explainer: animated scenes on a clock, narration per scene, captions
 * (karaoke-style highlighting), seeking, speed and quick-check questions that pause
 * the video until answered.
 */
export function ScenePlayer({
  video,
  active = true,
  startAt = 0,
  controls = 'full',
  narration = true,
  onTime,
  onEnded,
  styleId,
  captions,
}: Props) {
  const scenes = video.scenes;
  const { t: tr } = useTranslation('videos');
  const total = durationOf(scenes);
  const starts = useMemo(
    () => scenes.reduce<number[]>((acc, s, i) => [...acc, i === 0 ? 0 : acc[i - 1] + scenes[i - 1].seconds], []),
    [scenes],
  );
  const [t, setT] = useState(Math.min(startAt, Math.max(0, total - 0.1)));
  const tRef = useRef(t);
  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [ccOverride, setCcOverride] = useState<boolean | null>(null);
  const [voiceOn, setVoiceOn] = useState(narration && video.settings.voiceId !== 'none');
  const onEndedRef = useRef(onEnded);
  const onTimeRef = useRef(onTime);
  useEffect(() => {
    onEndedRef.current = onEnded;
    onTimeRef.current = onTime;
  }, [onEnded, onTime]);
  const cc = ccOverride ?? captions ?? video.settings.captions;
  const ended = t >= total;
  const playing = active && !paused && !ended;
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [barW, setBarW] = useState(1);
  const lastSpoken = useRef(-1);
  const s = styleOf(styleId ?? video.settings.styleId);

  const idx = Math.max(
    0,
    starts.findIndex((st, i) => t >= st && t < st + scenes[i].seconds),
  );
  const scene = scenes[Math.min(idx, scenes.length - 1)];
  const within = scene ? (t - starts[idx]) / scene.seconds : 0;
  const waitingForAnswer = scene?.kind === 'check' && answers[scene.id] === undefined && within > 0.35;

  // The clock: 10 ticks a second, paused on unanswered quick checks.
  useEffect(() => {
    if (!playing || waitingForAnswer || !scenes.length) return;
    const h = setInterval(() => {
      const next = Math.min(total, tRef.current + 0.1 * speed);
      tRef.current = next;
      setT(next);
      if (next >= total) onEndedRef.current?.();
    }, 100);
    return () => clearInterval(h);
  }, [playing, waitingForAnswer, speed, total, scenes.length]);

  useEffect(() => {
    onTimeRef.current?.(t);
  }, [t]);

  // A new speed restarts the narration from the current moment at that speed.
  useEffect(() => {
    lastSpoken.current = -1;
  }, [speed]);

  // Narrate each scene as it starts. A recorded track resumes where the clock is (after a pause
  // or a seek); the device voice starts the scene's line again.
  useEffect(() => {
    if (!playing || !voiceOn || !scene) {
      narrator.stop();
      lastSpoken.current = -1;
      return;
    }
    if (lastSpoken.current !== idx) {
      lastSpoken.current = idx;
      narrator.speak(scene.caption, video.settings.voiceId, speed, scene.audio, tRef.current - starts[idx]);
    }
  }, [playing, voiceOn, idx, scene, speed, starts, video.settings.voiceId]);
  useEffect(() => () => narrator.stop(), []);

  if (!scene) return <View style={[StyleSheet.absoluteFill, { backgroundColor: Colors.backgroundDeep }]} />;

  const seek = (to: number) => {
    lastSpoken.current = -1;
    tRef.current = Math.max(0, Math.min(total - 0.05, to));
    setT(tRef.current);
  };
  const play = () => {
    if (ended) seek(0);
    setPaused(false);
  };
  const toggle = () => (playing ? setPaused(true) : play());
  const words = scene.caption.split(' ');
  const lit = Math.ceil(words.length * Math.min(1, within * 1.15));

  return (
    <View style={StyleSheet.absoluteFill}>
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={toggle}
        accessibilityRole="button"
        accessibilityLabel={playing ? tr('player.pauseVideo') : tr('player.playVideo')}>
        <SceneView
          key={scene.id}
          scene={scene}
          style={s}
          inset={controls === 'minimal' ? FEED_INSET : FULL_INSET}
          answer={answers[scene.id] ?? null}
          onAnswer={(i) => {
            setAnswers((a) => ({ ...a, [scene.id]: i }));
            setPaused(false);
          }}
        />
      </Pressable>

      {!playing && !waitingForAnswer && (
        <Pressable
          onPress={play}
          style={styles.bigPlay}
          accessibilityRole="button"
          accessibilityLabel={ended ? tr('player.replay') : tr('player.play')}>
          <Ionicons name={ended ? 'refresh' : 'play'} size={36} color="#fff" style={{ marginLeft: ended ? 0 : 4 }} />
        </Pressable>
      )}

      {cc && !waitingForAnswer && (
        <View
          style={[
            styles.caption,
            controls === 'minimal' && styles.captionFeed,
            video.settings.captionStyle === 'bold' && styles.captionBold,
          ]}
          pointerEvents="none">
          <Text
            center
            style={[
              styles.captionText,
              video.settings.captionStyle === 'bold' && {
                fontSize: 20,
                lineHeight: 28,
              },
            ]}>
            {video.settings.captionStyle === 'karaoke'
              ? words.map((w, i) => (
                  <Text key={i} style={[styles.captionText, { color: i < lit ? '#FFE27A' : '#FFFFFF' }]}>
                    {w}
                    {i < words.length - 1 ? ' ' : ''}
                  </Text>
                ))
              : scene.caption}
          </Text>
        </View>
      )}

      <View style={styles.bottom}>
        <Pressable
          onLayout={(e: LayoutChangeEvent) => setBarW(e.nativeEvent.layout.width)}
          onPress={(e) => seek((e.nativeEvent.locationX / barW) * total)}
          accessibilityRole="adjustable"
          accessibilityLabel={tr('player.seek', { current: clock(t), total: clock(total) })}
          style={styles.track}>
          <View style={styles.trackBg}>
            {starts.slice(1).map((st, i) => (
              <View key={i} style={[styles.tick, { left: `${(st / total) * 100}%` }]} />
            ))}
            <View style={[styles.fill, { width: `${(t / total) * 100}%` }]} />
          </View>
        </Pressable>
        {controls === 'full' && (
          <View style={styles.controls}>
            <CtrlButton
              icon={playing ? 'pause' : 'play'}
              label={playing ? tr('player.pause') : tr('player.play')}
              onPress={toggle}
            />
            <CtrlButton
              icon="play-skip-back"
              label={tr('player.previousScene')}
              onPress={() => seek(starts[Math.max(0, idx - (within < 0.15 ? 1 : 0))])}
            />
            <CtrlButton
              icon="play-skip-forward"
              label={tr('player.nextScene')}
              onPress={() => seek(starts[Math.min(scenes.length - 1, idx + 1)])}
            />
            <Text variant="small" color="#fff" style={{ flex: 1, fontSize: 12 }}>
              {clock(t)} / {clock(total)}
            </Text>
            <Pressable
              onPress={() => setSpeed(SPEEDS[(SPEEDS.indexOf(speed) + 1) % SPEEDS.length])}
              accessibilityRole="button"
              accessibilityLabel={tr('player.speed', { speed: formatNumber(speed) })}
              style={styles.pill}>
              <Text variant="label" color="#fff">
                {tr('player.speedValue', { speed: formatNumber(speed) })}
              </Text>
            </Pressable>
            <CtrlButton
              icon={cc ? 'chatbox-ellipses' : 'chatbox-outline'}
              label={cc ? tr('player.hideCaptions') : tr('player.showCaptions')}
              onPress={() => setCcOverride(!cc)}
            />
            <CtrlButton
              icon={voiceOn ? 'volume-high' : 'volume-mute'}
              label={voiceOn ? tr('player.muteNarration') : tr('player.unmuteNarration')}
              onPress={() => setVoiceOn((v) => !v)}
            />
          </View>
        )}
      </View>
    </View>
  );
}

function CtrlButton({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} hitSlop={8} accessibilityRole="button" accessibilityLabel={label} style={styles.ctrl}>
      <Ionicons name={icon} size={20} color="#fff" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bigPlay: {
    position: 'absolute',
    alignSelf: 'center',
    top: '42%',
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  caption: {
    position: 'absolute',
    left: Spacing.md,
    right: Spacing.md,
    bottom: 96,
    backgroundColor: 'rgba(0,0,0,0.62)',
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
  },
  // The feed overlays an action rail on the right and video info at the bottom.
  captionFeed: { bottom: 200, right: 76 },
  captionBold: { backgroundColor: 'rgba(0,0,0,0.75)', paddingVertical: 10 },
  captionText: {
    color: '#fff',
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 15,
    lineHeight: 21,
  },
  bottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    gap: 4,
  },
  track: { paddingVertical: 10 },
  trackBg: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.25)',
    overflow: 'hidden',
  },
  tick: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: 'rgba(0,0,0,0.45)',
    zIndex: 2,
  },
  fill: { height: 4, backgroundColor: '#FFC857' },
  controls: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  ctrl: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
});
