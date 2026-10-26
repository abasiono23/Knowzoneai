import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
  type NativeScrollEvent,
  type ScrollViewInstance,
  type NativeSyntheticEvent,
} from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Text } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useWorld } from '@/lib/world/store';

type SlideId = 'worlds' | 'stars' | 'kora' | 'fairPlay';

/** Title, body and bullets come from world:intro.slides.<id>. */
const SLIDES: { id: SlideId; icon: keyof typeof Ionicons.glyphMap; emoji: string; color: string }[] = [
  { id: 'worlds', icon: 'map', emoji: '🗺️', color: '#7C5CFF' },
  { id: 'stars', icon: 'star', emoji: '⭐', color: '#FFC857' },
  { id: 'kora', icon: 'sparkles', emoji: '🦉', color: '#2DD4BF' },
  { id: 'fairPlay', icon: 'shield-checkmark', emoji: '🤝', color: '#4CC9FF' },
];
const BULLETS = ['b1', 'b2', 'b3'] as const;

/** Screen 130: how the game works, in four swipeable cards. */
export default function GameIntroScreen() {
  const { t } = useTranslation('world');
  const { width } = useWindowDimensions();
  const pageW = Math.min(width, 560);
  const { finishOnboarding, avatar } = useWorld();
  const [page, setPage] = useState(0);
  const scroller = useRef<ScrollViewInstance>(null);
  const last = page === SLIDES.length - 1;

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) =>
    setPage(Math.round(e.nativeEvent.contentOffset.x / pageW));
  const go = (n: number) => {
    scroller.current?.scrollTo({ x: n * pageW, animated: true });
    setPage(n);
  };
  const done = () => {
    finishOnboarding();
    router.replace(avatar ? '/play' : '/world/avatar/create');
  };

  return (
    <SafeAreaView style={styles.wrap}>
      <View style={styles.top}>
        <Text variant="label" color={Colors.textMuted}>
          {t('intro.eyebrow', { page: page + 1, total: SLIDES.length })}
        </Text>
        {!last && <Button variant="ghost" title={t('actions.skip', { ns: 'common' })} onPress={done} style={{ paddingHorizontal: 0, minHeight: 0 }} />}
      </View>
      <ScrollView
        ref={scroller}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScroll}
        onScroll={onScroll}
        scrollEventThrottle={64}
        style={{ width: pageW, alignSelf: 'center' }}>
        {SLIDES.map((s) => (
          <View key={s.id} style={[styles.slide, { width: pageW }]}>
            <Animated.View
              entering={ZoomIn.springify()}
              style={[styles.icon, { backgroundColor: s.color + '22', borderColor: s.color }]}>
              <Text style={{ fontSize: 64, lineHeight: 76 }}>{s.emoji}</Text>
            </Animated.View>
            <Text variant="display" center>
              {t(`intro.slides.${s.id}.title`)}
            </Text>
            <Text color={Colors.textSecondary} center>
              {t(`intro.slides.${s.id}.body`)}
            </Text>
            <View style={styles.bullets}>
              {BULLETS.map((b) => (
                <View key={b} style={styles.bullet}>
                  <Ionicons name={s.icon} size={16} color={s.color} />
                  <Text variant="small" style={{ flex: 1 }}>
                    {t(`intro.slides.${s.id}.${b}`)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
      <View style={styles.dots}>
        {SLIDES.map((s, k) => (
          <View key={s.id} style={[styles.dot, k === page && styles.dotOn]} />
        ))}
      </View>
      <View style={styles.footer}>
        <Button
          title={last ? t('intro.createAvatar') : t('actions.next', { ns: 'common' })}
          icon={last ? 'person-add' : 'arrow-forward'}
          onPress={() => (last ? done() : go(page + 1))}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: Colors.backgroundDeep },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    minHeight: 48,
  },
  slide: { padding: Spacing.lg, gap: Spacing.md, alignItems: 'center', justifyContent: 'center' },
  icon: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  bullets: {
    alignSelf: 'stretch',
    gap: Spacing.xs,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bullet: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, paddingVertical: Spacing.sm },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.borderStrong },
  dotOn: { width: 24, backgroundColor: Colors.primary },
  footer: { padding: Spacing.md, maxWidth: 560, width: '100%', alignSelf: 'center' },
});
