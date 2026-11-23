import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FONT, GameBackground, PrimaryButton, W } from '@/components/games/ui';
import { Text } from '@/components/ui';
import { Fonts } from '@/constants/theme';
import { useWorld } from '@/lib/world/store';

type SlideId = 'worlds' | 'stars' | 'kora' | 'fairPlay';

/** Title, body and bullets come from world:intro.slides.<id>. */
const SLIDES: { id: SlideId; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'worlds', icon: 'map-outline' },
  { id: 'stars', icon: 'star-outline' },
  { id: 'kora', icon: 'sparkles-outline' },
  { id: 'fairPlay', icon: 'shield-checkmark-outline' },
];
const BULLETS = ['b1', 'b2', 'b3'] as const;

/** How the game works, in four short steps (Back / Next buttons, no swiping needed). */
export default function GameIntroScreen() {
  const { t } = useTranslation('world');
  const { finishOnboarding, avatar } = useWorld();
  const [page, setPage] = useState(0);
  const last = page === SLIDES.length - 1;
  const s = SLIDES[page];
  const done = () => {
    finishOnboarding();
    router.replace(avatar ? '/play' : '/world/avatar/create');
  };

  return (
    <GameBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.top}>
          <Text style={styles.eyebrow}>{t('intro.eyebrow', { page: page + 1, total: SLIDES.length }).toUpperCase()}</Text>
          {!last && (
            <Pressable onPress={done} accessibilityRole="button" style={styles.skip}>
              <Text style={styles.skipText}>{t('actions.skip', { ns: 'common' })}</Text>
            </Pressable>
          )}
        </View>
        <View style={styles.steps} accessible accessibilityLabel={t('intro.eyebrow', { page: page + 1, total: SLIDES.length })}>
          {SLIDES.map((x, k) => (
            <View key={x.id} style={[styles.step, k <= page && { backgroundColor: W.ink }]} />
          ))}
        </View>
        <ScrollView contentContainerStyle={styles.slide}>
          <Animated.View key={s.id} entering={FadeIn.duration(220)} style={{ gap: 16, alignItems: 'center' }}>
            <View style={styles.icon}>
              <Ionicons name={s.icon} size={40} color={W.ink} />
            </View>
            <Text style={styles.title} accessibilityRole="header">
              {t(`intro.slides.${s.id}.title`)}
            </Text>
            <Text style={styles.body}>{t(`intro.slides.${s.id}.body`)}</Text>
            <View style={styles.bullets}>
              {BULLETS.map((b) => (
                <View key={b} style={styles.bullet}>
                  <Ionicons name="checkmark" size={18} color={W.correct} />
                  <Text style={[styles.body, { flex: 1, textAlign: 'left', fontSize: 15 }]}>{t(`intro.slides.${s.id}.${b}`)}</Text>
                </View>
              ))}
            </View>
          </Animated.View>
        </ScrollView>
        <View style={styles.footer}>
          {page > 0 && (
            <Pressable onPress={() => setPage(page - 1)} accessibilityRole="button" style={styles.back}>
              <Text style={styles.skipText}>{t('actions.back', { ns: 'common' })}</Text>
            </Pressable>
          )}
          <PrimaryButton
            title={last ? t('intro.createAvatar') : t('actions.next', { ns: 'common' })}
            icon="arrow-forward"
            onPress={() => (last ? done() : setPage(page + 1))}
            style={{ flex: 1 }}
          />
        </View>
      </SafeAreaView>
    </GameBackground>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, minHeight: 52, maxWidth: 560, width: '100%', alignSelf: 'center' },
  eyebrow: { fontFamily: Fonts.bold, fontSize: 11, letterSpacing: 1.2, color: W.muted },
  skip: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 8 },
  skipText: { fontFamily: Fonts.bold, fontSize: 15, color: W.inkSoft },
  steps: { flexDirection: 'row', gap: 6, paddingHorizontal: 20, maxWidth: 560, width: '100%', alignSelf: 'center' },
  step: { flex: 1, height: 4, borderRadius: 2, backgroundColor: W.line },
  slide: { padding: 24, gap: 16, maxWidth: 560, width: '100%', alignSelf: 'center', flexGrow: 1, justifyContent: 'center' },
  icon: { width: 88, height: 88, borderRadius: 44, borderWidth: 1.5, borderColor: W.ink, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: FONT, fontSize: 28, lineHeight: 34, letterSpacing: -0.5, color: W.ink, textAlign: 'center' },
  body: { fontFamily: Fonts.regular, fontSize: 16, lineHeight: 24, color: W.inkSoft, textAlign: 'center' },
  bullets: { alignSelf: 'stretch', gap: 10, padding: 16, borderRadius: 16, backgroundColor: W.surface, borderWidth: 1, borderColor: W.line },
  bullet: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  footer: { flexDirection: 'row', gap: 10, alignItems: 'center', padding: 16, maxWidth: 560, width: '100%', alignSelf: 'center' },
  back: { minHeight: 52, justifyContent: 'center', paddingHorizontal: 16 },
});
