import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useRef, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, useWindowDimensions, View, type ScrollViewInstance } from 'react-native';
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Backdrop } from '@/components/brand/backdrop';
import {
  MeetIllustration,
  RewardsIllustration,
  TutorIllustration,
  VideoIllustration,
} from '@/components/onboarding/illustrations';
import { Button, Text } from '@/components/ui';
import { Colors, Palette, Spacing } from '@/constants/theme';

type Slide = { key: 'meet' | 'videos' | 'tutor' | 'rewards'; color: string; art: ReactNode };

// Copy lives in auth:onboarding.slides.<key>.
const SLIDES: Slide[] = [
  { key: 'meet', color: Palette.purple300, art: <MeetIllustration /> },
  { key: 'videos', color: Palette.teal400, art: <VideoIllustration /> },
  { key: 'tutor', color: Palette.sky400, art: <TutorIllustration /> },
  { key: 'rewards', color: Palette.gold400, art: <RewardsIllustration /> },
];

export default function OnboardingScreen() {
  const { t } = useTranslation('auth');
  const { width } = useWindowDimensions();
  const scrollRef = useRef<ScrollViewInstance>(null);
  const x = useSharedValue(0);
  const [index, setIndex] = useState(0);
  const last = index === SLIDES.length - 1;

  const onScroll = useAnimatedScrollHandler((e) => {
    x.value = e.contentOffset.x;
  });

  const goTo = (i: number) => {
    scrollRef.current?.scrollTo({ x: i * width, animated: true });
    setIndex(i);
  };

  const next = () => {
    Haptics.selectionAsync().catch(() => {});
    if (last) router.push('/get-started');
    else goTo(index + 1);
  };

  return (
    <View style={styles.fill}>
      <Backdrop variant="hero" />
      <SafeAreaView style={styles.fill}>
        <View style={styles.topBar}>
          <Text variant="label" color={Colors.textMuted}>
            {t('onboarding.progress', { current: index + 1, total: SLIDES.length })}
          </Text>
          {!last && (
            <Pressable onPress={() => router.push('/get-started')} hitSlop={12} accessibilityRole="button">
              <Text variant="bodyStrong" color={Colors.textSecondary}>
                {t('actions.skip', { ns: 'common' })}
              </Text>
            </Pressable>
          )}
        </View>

        <Animated.ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
          onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}>
          {SLIDES.map((s, i) => (
            <SlideView key={s.key} slide={s} i={i} x={x} width={width} />
          ))}
        </Animated.ScrollView>

        <View style={styles.bottom}>
          <View style={styles.dots}>
            {SLIDES.map((s, i) => (
              <Dot key={s.key} i={i} x={x} width={width} onPress={() => goTo(i)} />
            ))}
          </View>
          <Button
            title={last ? t('onboarding.letsGo') : t('actions.next', { ns: 'common' })}
            icon={last ? 'rocket' : undefined}
            onPress={next}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

function SlideView({ slide, i, x, width }: { slide: Slide; i: number; x: SharedValue<number>; width: number }) {
  const { t } = useTranslation('auth');
  // Parallax: art drifts slower than the page, text fades between slides.
  const artStyle = useAnimatedStyle(() => {
    const p = (x.value - i * width) / width;
    return { transform: [{ translateX: p * width * 0.35 }, { scale: interpolate(Math.abs(p), [0, 1], [1, 0.85]) }] };
  });
  const textStyle = useAnimatedStyle(() => {
    const p = Math.abs((x.value - i * width) / width);
    return { opacity: interpolate(p, [0, 0.6], [1, 0]), transform: [{ translateY: p * 24 }] };
  });

  return (
    <View style={[styles.slide, { width }]}>
      <Animated.View style={[styles.art, artStyle]}>{slide.art}</Animated.View>
      <Animated.View style={[styles.copy, textStyle]}>
        <Text variant="label" color={slide.color} center>
          {t(`onboarding.slides.${slide.key}.eyebrow`)}
        </Text>
        <Text variant="display" center>
          {t(`onboarding.slides.${slide.key}.title`)}
        </Text>
        <Text variant="body" color={Colors.textSecondary} center>
          {t(`onboarding.slides.${slide.key}.body`)}
        </Text>
      </Animated.View>
    </View>
  );
}

function Dot({ i, x, width, onPress }: { i: number; x: SharedValue<number>; width: number; onPress: () => void }) {
  const { t } = useTranslation('auth');
  const style = useAnimatedStyle(() => {
    const p = Math.abs(x.value / width - i);
    const k = Math.max(0, 1 - p);
    return {
      width: 8 + 20 * k,
      backgroundColor: interpolateColor(k, [0, 1], [Colors.surfaceRaised, Palette.purple500]),
    };
  });
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={t('onboarding.goToSlide', { number: i + 1 })}>
      <Animated.View style={[styles.dot, style]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xs,
    height: 40,
  },
  slide: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.lg, overflow: 'hidden' },
  art: { width: '100%', alignItems: 'center' },
  copy: { gap: Spacing.sm, maxWidth: 420, marginTop: Spacing.md },
  bottom: {
    gap: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  dot: { height: 8, borderRadius: 4 },
});
