import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Animated, Easing, Platform, ScrollView, StyleSheet, Text as RNText, View, type ScrollViewInstance } from 'react-native';

import { Fonts } from '@/constants/theme';
import { lessonAsset, type BoardItem, type BoardScene } from '@/lib/kora/lessons';

/** The board's own colours: a pale page on the lesson's deep purple, like the lesson videos. */
export const Board = {
  ink: '#160A4D',
  page: '#FBFAFF',
  lilac: '#EFE9FF',
  purple: '#6A45FF',
  yellow: '#FFD84D',
  green: '#12966F',
  greenSoft: '#E6F7EF',
  red: '#D8344F',
  redSoft: '#FFECEF',
  muted: '#5B5785',
};

type Props = {
  lessonId: string;
  scene: BoardScene;
  /** The lesson's clock, in seconds. */
  time: number;
  width: number;
  /** Shown under the quick-check question while the lesson waits (the countdown and its button). */
  footer?: ReactNode;
};

/**
 * What Kora has written so far: the scene's heading, then each item from the moment she reaches it.
 * The lesson is in English, so the board always reads left to right.
 */
export function LessonBoard({ lessonId, scene, time, width, footer }: Props) {
  const [height, setHeight] = useState(0);
  const shown = scene.items.filter((it) => time >= it.at);
  // A picture or the moving clip sits beside the writing on a wide board, and above it on a phone.
  const isMedia = (it: BoardItem) => it.kind === 'image' || it.kind === 'clip';
  const media = shown.find(isMedia);
  const written = shown.filter((it) => !isMedia(it));
  const beside = width >= 600;
  // Type scales with the board, between a phone's width and a laptop's; a little smaller when a picture shares the board.
  const u = Math.max(13, Math.min(27, width / 24)) * (beside && scene.items.some(isMedia) ? 0.82 : 1);
  const pad = u * 1.05;
  const scroll = useRef<ScrollViewInstance>(null);
  const count = written.length;
  useEffect(() => {
    // On a small phone a full board is taller than its frame: keep the newest line in view.
    if (count > 2) scroll.current?.scrollToEnd({ animated: true });
  }, [count]);
  const lines = written.map((it, i) => (
    <Rise key={`${scene.at}-${i}-${it.kind}`}>
      <Item item={it} u={u} index={stepNumber(scene.items, it)} />
    </Rise>
  ));
  const picture = media && (
    <Rise key={`${scene.at}-media`}>
      <Media lessonId={lessonId} item={media} u={u} />
    </Rise>
  );
  // The picture stays put while the writing beside it (or under it, on a phone) scrolls as it grows.
  const text = (
    <ScrollView ref={scroll} style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: pad, gap: u * 0.62, flexGrow: 1 }}>
      <View style={{ alignSelf: 'flex-start', maxWidth: '100%' }}>
        <RNText style={[styles.heading, { fontSize: u * 1.38, lineHeight: u * 1.75 }]}>{scene.heading}</RNText>
        <View style={{ height: Math.max(3, u * 0.22), borderRadius: 3, backgroundColor: Board.yellow, marginTop: 2, width: '100%' }} />
      </View>
      {lines}
      {footer}
    </ScrollView>
  );
  return (
    <View style={[styles.page, { borderRadius: u * 1.1 }]} onLayout={(e) => setHeight(e.nativeEvent.layout.height)}>
      {!media ? (
        text
      ) : beside ? (
        <View style={{ flex: 1, flexDirection: 'row' }}>
          {text}
          <View style={{ width: '50%', padding: pad, paddingLeft: 0, justifyContent: 'center' }}>{picture}</View>
        </View>
      ) : (
        <>
          <View style={{ paddingHorizontal: pad, paddingTop: pad, alignItems: 'center' }}>
            <View style={{ width: Math.min(width - pad * 2, Math.max(140, height * 0.36) * (media.kind === 'clip' ? 1.75 : 1.3)) }}>{picture}</View>
          </View>
          {text}
        </>
      )}
    </View>
  );
}

/** A board picture (a credited photograph or diagram), or the lesson's short silent clip, with its caption. */
function Media({ lessonId, item, u }: { lessonId: string; item: BoardItem; u: number }) {
  const uri = lessonAsset(lessonId, item.src ?? '');
  return (
    <View style={{ gap: u * 0.3 }}>
      {item.kind === 'clip' ? (
        <Clip uri={uri} radius={u * 0.7} />
      ) : (
        <Image
          source={{ uri }}
          style={{ width: '100%', aspectRatio: 1.3, borderRadius: u * 0.7, backgroundColor: '#fff' }}
          contentFit="contain"
          transition={200}
          accessibilityLabel={item.text}
        />
      )}
      {!!item.text && <RNText style={[styles.text, { fontSize: Math.max(11.5, u * 0.74), lineHeight: Math.max(16, u * 1.05), textAlign: 'center', color: Board.muted }]}>{item.text}</RNText>}
      {!!item.credit && <RNText style={[styles.text, { fontSize: 10, lineHeight: 13, textAlign: 'center', color: Board.muted, opacity: 0.8 }]}>{item.credit}</RNText>}
    </View>
  );
}

function Clip({ uri, radius }: { uri: string; radius: number }) {
  const player = useVideoPlayer(uri, (p) => {
    p.muted = true;
    p.loop = true;
    p.play();
  });
  return (
    <View style={{ width: '100%', aspectRatio: 1.75, borderRadius: radius, overflow: 'hidden', backgroundColor: '#0A1C4A' }}>
      <VideoView player={player} style={StyleSheet.absoluteFill} contentFit="cover" nativeControls={false} />
    </View>
  );
}

/** What marks a board line as code rather than a formula: indentation, or a Python keyword or call at its start. */
const CODE = /^ {2,}|^(if|elif|else|for|while|def|return|print|import)\b|\b(print|input|range|len)\(|^[a-z_0-9]+ = (input|[a-z_]+\(|[a-z_0-9]+ [*+/-] [a-z_0-9]+$|"|True|False|\d+$)/;
/** A space that is kept at the start of a line, so code stays indented. */
const NBSP = String.fromCharCode(160);
const MONO = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'ui-monospace, Menlo, Consolas, monospace' });

/** A step's number among the scene's steps. */
const stepNumber = (items: BoardItem[], it: BoardItem) => items.filter((x) => x.kind === 'step').indexOf(it) + 1;

/** Each new line fades up into place. */
function Rise({ children }: { children: ReactNode }) {
  const [v] = useState(() => new Animated.Value(0));
  useEffect(() => {
    Animated.timing(v, { toValue: 1, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: Platform.OS !== 'web' }).start();
  }, [v]);
  return (
    <Animated.View style={{ opacity: v, transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }] }}>
      {children}
    </Animated.View>
  );
}

function Item({ item, u, index }: { item: BoardItem; u: number; index: number }) {
  const body = { fontSize: u, lineHeight: u * 1.42 };
  switch (item.kind) {
    case 'term':
      return (
        <View style={[styles.term, { borderRadius: u * 0.7, paddingVertical: u * 0.45, paddingHorizontal: u * 0.7, borderLeftWidth: Math.max(4, u * 0.3) }]}>
          <RNText style={[styles.strong, body, { color: Board.purple }]}>{item.text}</RNText>
          {!!item.detail && <RNText style={[styles.text, body, { fontSize: u * 0.94 }]}>{item.detail}</RNText>}
        </View>
      );
    case 'formula': {
      // A line of code keeps its indentation and reads from the left, in a fixed-width face; a formula sits in the middle.
      const code = CODE.test(item.text);
      return (
        <View style={[styles.formula, { borderRadius: u * 0.7, paddingVertical: u * 0.5, paddingHorizontal: u * 0.8 }]}>
          <RNText style={[styles.strong, code ? { fontFamily: MONO, fontWeight: '700', fontSize: u * 0.98, lineHeight: u * 1.5 } : { fontSize: u * 1.16, lineHeight: u * 1.6, textAlign: 'center' }]}>
            {code ? item.text.replace(/^ +/, (m) => NBSP.repeat(m.length)) : item.text}
          </RNText>
        </View>
      );
    }
    case 'step':
      return (
        <View style={styles.row}>
          <View style={[styles.badge, { width: u * 1.5, height: u * 1.5, borderRadius: u, backgroundColor: Board.purple }]}>
            <RNText style={[styles.strong, { color: '#fff', fontSize: u * 0.85 }]}>{index}</RNText>
          </View>
          <RNText style={[styles.strong, body, styles.flex]}>{item.text}</RNText>
        </View>
      );
    case 'wrong':
    case 'right': {
      const ok = item.kind === 'right';
      return (
        <View style={[styles.row, { backgroundColor: ok ? Board.greenSoft : Board.redSoft, borderRadius: u * 0.7, paddingVertical: u * 0.4, paddingHorizontal: u * 0.6 }]}>
          <Ionicons name={ok ? 'checkmark-circle' : 'close-circle'} size={u * 1.35} color={ok ? Board.green : Board.red} />
          <RNText style={[styles.strong, body, styles.flex, { fontSize: u * 0.96 }]}>{item.text}</RNText>
        </View>
      );
    }
    case 'tip':
      return (
        <View style={[styles.row, { backgroundColor: Board.yellow, borderRadius: u * 0.7, paddingVertical: u * 0.5, paddingHorizontal: u * 0.7 }]}>
          <Ionicons name="bulb" size={u * 1.3} color={Board.ink} />
          <RNText style={[styles.strong, body, styles.flex]}>{item.text}</RNText>
        </View>
      );
    case 'question':
      return (
        <View style={[styles.question, { borderRadius: u * 0.9, padding: u * 0.9, gap: u * 0.5 }]}>
          <Ionicons name="help-circle" size={u * 2} color={Board.purple} />
          <RNText style={[styles.strong, { fontSize: u * 1.2, lineHeight: u * 1.65 }, styles.flex]}>{item.text}</RNText>
        </View>
      );
    default:
      return (
        <View style={styles.row}>
          <View style={{ width: u * 0.42, height: u * 0.42, borderRadius: u, backgroundColor: Board.purple, marginTop: u * 0.5, alignSelf: 'flex-start' }} />
          <RNText style={[styles.text, body, styles.flex]}>{item.text}</RNText>
        </View>
      );
  }
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: Board.page, overflow: 'hidden' },
  flex: { flex: 1 },
  heading: { fontFamily: Fonts.extrabold, color: Board.ink, letterSpacing: -0.3, writingDirection: 'ltr' },
  text: { fontFamily: Fonts.semibold, color: Board.ink, writingDirection: 'ltr', textAlign: 'left' },
  strong: { fontFamily: Fonts.extrabold, color: Board.ink, writingDirection: 'ltr', textAlign: 'left' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  badge: { alignItems: 'center', justifyContent: 'center' },
  term: { backgroundColor: Board.lilac, borderLeftColor: Board.purple, gap: 1 },
  formula: { backgroundColor: '#fff', borderWidth: 2, borderColor: Board.lilac, alignSelf: 'stretch' },
  question: { backgroundColor: Board.lilac, flexDirection: 'row', alignItems: 'flex-start' },
});
