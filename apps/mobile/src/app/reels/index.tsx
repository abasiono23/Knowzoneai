import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Share,
  StyleSheet,
  useWindowDimensions,
  View,
  type GestureResponderEvent,
} from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  FadeIn,
  FadeInDown,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CommentsSheet } from '@/components/reels/comments-sheet';
import { HeartBurst, heartAt, tapTime, type Heart } from '@/components/reels/heart-burst';
import { LinearGradient } from '@/components/ui/gradient';
import { Text } from '@/components/ui';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { errorText } from '@/i18n/errors';
import { USE_MOCKS } from '@/lib/config';
import { pretty } from '@/lib/exams';
import { cardSeconds, media, reelsApi, type Reel } from '@/lib/reels';
import { useSession } from '@/lib/session';
import { narrator } from '@/lib/videos/narrator';

/**
 * Flashcards: a "Did you know?" feed like short videos. Swipe up for the next reel; each reel plays
 * its 5 cards in turn (picture slowly zooming, words sliding in, English narration), and you can
 * like it, comment, share it, or tap the sides to go back or forward a card.
 */
export default function Reels() {
  const { t, i18n } = useTranslation('reels');
  const { height } = useWindowDimensions();
  const [reels, setReels] = useState<Reel[] | null>(null);
  const [error, setError] = useState<string | null>(USE_MOCKS ? t('offline') : null);
  const [active, setActive] = useState(0);
  const [focused, setFocused] = useState(true);
  const [comments, setComments] = useState<Reel | null>(null);
  // Narration is English: on by default in English, off (tap to hear) in other languages.
  const [sound, setSound] = useState(i18n.language === 'en');

  const load = useCallback(() => {
    if (USE_MOCKS) return;
    reelsApi
      .feed()
      .then((r) => setReels(r.reels))
      .catch((e) => setError(errorText(e, t('loadFailed'))));
  }, [t]);
  useEffect(load, [load]);

  useFocusEffect(
    useCallback(() => {
      setFocused(true);
      return () => {
        setFocused(false);
        narrator.stop();
      };
    }, []),
  );

  const onViewable = useCallback(
    ({ viewableItems }: { viewableItems: { index?: number | null; isViewable: boolean }[] }) => {
      const first = viewableItems.find((v) => v.isViewable);
      if (first?.index != null) setActive(first.index);
    },
    [],
  );

  const update = (id: string, patch: Partial<Reel>) =>
    setReels((list) => list?.map((r) => (r.id === id ? { ...r, ...patch } : r)) ?? null);

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      {reels ? (
        <FlatList
          data={reels}
          keyExtractor={(r) => r.id}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          onViewableItemsChanged={onViewable}
          viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
          getItemLayout={(_, i) => ({ length: height, offset: height * i, index: i })}
          renderItem={({ item, index }) => (
            <ReelView
              reel={item}
              height={height}
              active={focused && !comments && index === active}
              sound={sound}
              onSound={() => setSound((s) => !s)}
              onLike={(liked, likes) => update(item.id, { liked, likes })}
              onComments={() => setComments(item)}
            />
          )}
        />
      ) : (
        <View style={styles.center}>
          {error ? (
            <>
              <Text color="#fff" center>
                {error}
              </Text>
              <Pressable onPress={load} accessibilityRole="button" style={styles.retry}>
                <Text color="#fff">{t('retry')}</Text>
              </Pressable>
            </>
          ) : (
            <ActivityIndicator color="#fff" size="large" />
          )}
        </View>
      )}
      <TopBar />
      <CommentsSheet
        reel={comments}
        onClose={() => setComments(null)}
        onCount={(id, n) => update(id, { comments: n })}
      />
    </View>
  );
}

function TopBar() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation('reels');
  return (
    <View style={[styles.top, { paddingTop: insets.top + Spacing.xs }]} pointerEvents="box-none">
      <Pressable
        onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
        accessibilityRole="button"
        accessibilityLabel={t('back')}
        style={styles.round}>
        <Ionicons name="chevron-back" size={22} color="#fff" />
      </Pressable>
      <Text style={{ fontFamily: Fonts.extrabold, fontSize: 18 }} color="#fff">
        {t('title')}
      </Text>
      <View style={{ width: 40 }} />
    </View>
  );
}

function ReelView({
  reel,
  height,
  active,
  sound,
  onSound,
  onLike,
  onComments,
}: {
  reel: Reel;
  height: number;
  active: boolean;
  sound: boolean;
  onSound: () => void;
  onLike: (liked: boolean, likes: number) => void;
  onComments: () => void;
}) {
  const { t } = useTranslation('reels');
  const { user } = useSession();
  const insets = useSafeAreaInsets();
  const [k, setK] = useState(0);
  // Paused with the button, or held down with a finger.
  const [paused, setPaused] = useState(false);
  const [held, setHeld] = useState(false);
  const stopped = paused || held;
  const card = reel.cards[k]!;
  const zoom = useSharedValue(1);
  const progress = useSharedValue(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // How much of the current card has played, so a pause carries on from the same moment.
  const played = useRef(0);
  const [hearts, setHearts] = useState<Heart[]>([]);
  const lastTap = useRef(0);
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // A new card starts from the beginning.
  useEffect(() => {
    played.current = 0;
    zoom.set(1);
    progress.set(0);
  }, [k, reel.id, zoom, progress]);

  // Play the current card: narration, the picture's slow zoom, the progress bar, then the next card.
  // Pausing freezes all three; playing again picks up where they stopped.
  useEffect(() => {
    if (!active || stopped) return;
    const left = Math.max(0, cardSeconds(card, sound && !!card.audio) * 1000 - played.current);
    const started = Date.now();
    if (sound && card.audio) narrator.speak(card.text, 'ada', 1, media(card.audio), played.current / 1000);
    zoom.set(withTiming(1.14, { duration: left, easing: Easing.linear }));
    progress.set(withTiming(1, { duration: left, easing: Easing.linear }));
    timer.current = setTimeout(() => setK((n) => (n + 1) % reel.cards.length), left);
    return () => {
      if (timer.current) clearTimeout(timer.current);
      played.current += Date.now() - started;
      cancelAnimation(zoom);
      cancelAnimation(progress);
      narrator.stop();
    };
  }, [active, stopped, k, sound, card, reel.cards.length, zoom, progress]);

  const picture = useAnimatedStyle(() => ({
    transform: [{ scale: zoom.get() }, { translateY: (zoom.get() - 1) * -60 }],
  }));
  const bar = useAnimatedStyle(() => ({ width: `${progress.get() * 100}%` }));

  /**
   * A single tap moves between cards (or plays again when paused); two quick taps like the reel, with a
   * heart where you tapped. The single tap waits a moment, in case a second tap is coming.
   */
  const tap = (e: GestureResponderEvent, single: () => void) => {
    const now = tapTime();
    if (now - lastTap.current < 280) {
      lastTap.current = 0;
      if (tapTimer.current) clearTimeout(tapTimer.current);
      if (!user) return;
      const heart = heartAt(e);
      setHearts((h) => [...h, heart]);
      setTimeout(() => setHearts((h) => h.filter((x) => x.id !== heart.id)), 1000);
      if (!reel.liked) void like();
      return;
    }
    lastTap.current = now;
    tapTimer.current = setTimeout(() => (paused ? setPaused(false) : single()), 280);
  };

  const like = async () => {
    if (!user) return;
    const next = !reel.liked;
    onLike(next, reel.likes + (next ? 1 : -1));
    try {
      const res = await reelsApi.like(reel.id, next);
      onLike(res.liked, res.likes);
    } catch {
      onLike(!next, reel.likes);
    }
  };

  return (
    <View style={{ height, backgroundColor: '#000', overflow: 'hidden' }}>
      <Animated.View style={[StyleSheet.absoluteFill, picture]}>
        <Image
          source={{ uri: media(card.image) }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={250}
          accessible={false}
        />
      </Animated.View>
      {/* Preload the next card's picture. */}
      {reel.cards[k + 1] && (
        <Image source={{ uri: media(reel.cards[k + 1]!.image) }} style={{ width: 1, height: 1, opacity: 0 }} />
      )}
      <LinearGradient
        colors={['rgba(0,0,0,0.55)', 'transparent', 'transparent', 'rgba(0,0,0,0.85)']}
        locations={[0, 0.22, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Card progress, like stories. */}
      <View style={[styles.segments, { top: insets.top + 56 }]}>
        {reel.cards.map((_, i) => (
          <View key={i} style={styles.segment}>
            {i < k && <View style={[styles.segmentFill, { width: '100%' }]} />}
            {i === k && <Animated.View style={[styles.segmentFill, bar]} />}
          </View>
        ))}
      </View>

      {/* Tap left for the previous card, right for the next; double-tap to like; hold to pause. */}
      <View style={styles.taps}>
        <Pressable
          style={{ flex: 1 }}
          onPress={(e) => tap(e, () => setK((n) => Math.max(0, n - 1)))}
          onLongPress={() => setHeld(true)}
          onPressOut={() => setHeld(false)}
          accessibilityRole="button"
          accessibilityLabel={t('previous')}
        />
        <Pressable
          style={{ flex: 2 }}
          onPress={(e) => tap(e, () => setK((n) => (n + 1) % reel.cards.length))}
          onLongPress={() => setHeld(true)}
          onPressOut={() => setHeld(false)}
          accessibilityRole="button"
          accessibilityLabel={t('next')}
        />
      </View>

      {paused && (
        <Animated.View
          entering={FadeIn.duration(150)}
          exiting={FadeOut.duration(150)}
          style={styles.paused}
          pointerEvents="none">
          <Ionicons name="play" size={44} color="#fff" style={{ marginLeft: 6 }} />
        </Animated.View>
      )}
      {hearts.map((h) => (
        <HeartBurst key={h.id} heart={h} />
      ))}

      <View style={[styles.words, { bottom: insets.bottom + 40 }]} pointerEvents="none">
        <View style={styles.badge}>
          <Ionicons name="bulb" size={14} color="#3A2600" />
          <Text style={{ fontFamily: Fonts.extrabold, fontSize: 12 }} color="#3A2600">
            {t('didYouKnow')} · {t(`subjects.${reel.subject}`, { defaultValue: reel.subject })}
          </Text>
        </View>
        <Animated.View key={`${reel.id}-${k}`} entering={FadeInDown.duration(450)}>
          <Text style={[styles.cardText, k === 0 && { fontSize: 26, lineHeight: 33 }]} color="#fff">
            {pretty(card.text)}
          </Text>
        </Animated.View>
        <Text variant="small" color="rgba(255,255,255,0.75)">
          {t('card', { n: k + 1, total: reel.cards.length })}
        </Text>
      </View>

      <View style={[styles.rail, { bottom: insets.bottom + 120 }]}>
        <RailButton
          icon={paused ? 'play' : 'pause'}
          label={paused ? t('play') : t('pause')}
          a11y={paused ? t('play') : t('pause')}
          onPress={() => setPaused((p) => !p)}
        />
        <RailButton
          icon={reel.liked ? 'heart' : 'heart-outline'}
          color={reel.liked ? '#FF4D6D' : '#fff'}
          label={String(reel.likes)}
          a11y={reel.liked ? t('unlike') : t('like')}
          onPress={() => void like()}
        />
        <RailButton
          icon="chatbubble-ellipses"
          label={String(reel.comments)}
          a11y={t('comments')}
          onPress={onComments}
        />
        <RailButton
          icon="share-social"
          label={t('share')}
          a11y={t('share')}
          onPress={() => void Share.share({ message: `${reel.cards[0]!.text}\n\n${t('shareTail')}` }).catch(() => {})}
        />
        <RailButton
          icon={sound ? 'volume-high' : 'volume-mute'}
          label={sound ? t('soundOn') : t('soundOff')}
          a11y={sound ? t('mute') : t('unmute')}
          onPress={onSound}
        />
      </View>
    </View>
  );
}

function RailButton({
  icon,
  color = '#fff',
  label,
  a11y,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  color?: string;
  label: string;
  a11y: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={a11y}
      hitSlop={6}
      style={styles.railButton}>
      <Ionicons name={icon} size={32} color={color} />
      <Text style={{ fontFamily: Fonts.bold, fontSize: 12 }} color="#fff">
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md, padding: Spacing.lg },
  retry: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: Radius.pill, borderWidth: 1, borderColor: '#fff' },
  top: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
  },
  round: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  segments: { position: 'absolute', left: Spacing.md, right: Spacing.md, flexDirection: 'row', gap: 4 },
  segment: { flex: 1, height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.35)', overflow: 'hidden' },
  segmentFill: { height: 3, backgroundColor: '#fff' },
  taps: { ...StyleSheet.absoluteFill, flexDirection: 'row', top: 110, bottom: 220 },
  paused: {
    position: 'absolute',
    alignSelf: 'center',
    top: '42%',
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  words: { position: 'absolute', left: Spacing.md, right: 84, gap: Spacing.sm },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    backgroundColor: Colors.reward,
  },
  cardText: {
    fontFamily: Fonts.extrabold,
    fontSize: 21,
    lineHeight: 28,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowRadius: 8,
  },
  rail: { position: 'absolute', right: Spacing.sm, alignItems: 'center', gap: Spacing.md },
  railButton: { alignItems: 'center', gap: 2, minWidth: 56 },
});
