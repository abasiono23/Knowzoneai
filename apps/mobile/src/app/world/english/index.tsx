import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { GameCover } from '@/components/games/cover';
import { FONT, W } from '@/components/games/ui';
import { Wallet } from '@/components/world/world-ui';
import { Screen, ScreenHeader, Text } from '@/components/ui';
import { Fonts } from '@/constants/theme';
import { useFlipStyle } from '@/i18n/provider';
import { CEFR, ENGLISH_GAMES, gameHref, LEVEL_KEYS, levelKey, MAX_LEVEL, OPEN_LEVELS } from '@/lib/games/english';
import { suggestedLevel, useGamesCatalogue } from '@/lib/games/use-catalogue';

/** Word games hub: the five English games, where each one is up to, and the level ladder. */
export default function WordGamesHub() {
  const { t } = useTranslation('games');
  const flip = useFlipStyle();
  const { data, error, levelsOf } = useGamesCatalogue();
  const today = data?.rewardsToday;
  const cap = data?.dailyCap;

  return (
    <Screen withTabBar={false}>
      <ScreenHeader eyebrow={t('hub.eyebrow')} title={t('hub.title')} right={<Wallet compact />} />
      <Text style={styles.intro}>{t('hub.intro')}</Text>

      {error && (
        <View style={styles.notice}>
          <Ionicons name="cloud-offline-outline" size={20} color={W.muted} />
          <Text style={{ flex: 1, fontFamily: Fonts.regular, fontSize: 14, color: W.inkSoft }}>{error}</Text>
        </View>
      )}

      <View style={styles.list}>
        {ENGLISH_GAMES.map((game, k) => {
          const levels = levelsOf(game);
          const stars = levels.reduce((s, l) => s + l.bestStars, 0);
          const level = suggestedLevel(levels);
          const name = t(`english.${game}.name`);
          const where = t('ui.levelName', { level, name: t(`levels.names.${levelKey(level)}`) });
          return (
            <Animated.View key={game} entering={FadeIn.delay(k * 40).duration(200)}>
              <Pressable
                onPress={() => router.push(gameHref(game))}
                accessibilityRole="button"
                accessibilityLabel={`${name}. ${t(`english.${game}.tagline`)}. ${where}. ${t('hub.stars', { count: stars, max: MAX_LEVEL * 3 })}`}
                style={({ pressed }) => [styles.row, k > 0 && styles.rowLine, pressed && { backgroundColor: W.page }]}>
                <GameCover game={game} size={60} />
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={styles.name}>{name}</Text>
                  <Text style={styles.tagline}>{t(`english.${game}.tagline`)}</Text>
                  <View style={styles.meta}>
                    <Text style={styles.metaText}>{where}</Text>
                    <View style={styles.dot} />
                    <Ionicons name="star" size={12} color="#E2A100" />
                    <Text style={styles.metaText}>{`${stars}/${MAX_LEVEL * 3}`}</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={18} color={W.muted} style={flip} />
              </Pressable>
            </Animated.View>
          );
        })}
      </View>

      <View style={styles.ladder}>
        <Text style={styles.eyebrow}>{t('levels.ladder').toUpperCase()}</Text>
        <View style={styles.scale} accessible accessibilityLabel={LEVEL_KEYS.map((key, i) => `${i + 1} ${t(`levels.names.${key}`)} ${CEFR[i]}`).join(', ')}>
          {LEVEL_KEYS.map((key, i) => (
            <View key={key} style={[styles.step, { height: 14 + i * 4 }, i < OPEN_LEVELS && { backgroundColor: W.ink }]} />
          ))}
        </View>
        <View style={styles.scaleEnds}>
          <Text style={styles.metaText}>{`${t('levels.names.starter')} · A1`}</Text>
          <Text style={styles.metaText}>{`${t('levels.names.superHard')} · C2+`}</Text>
        </View>
        <Text style={styles.note}>{t('levels.openNote', { open: OPEN_LEVELS })}</Text>
      </View>

      {today && cap && (
        <View style={{ gap: 6 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={styles.metaText}>{t('hub.today', { xp: today.xp, cap: cap.xp })}</Text>
          </View>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${Math.min(1, today.xp / cap.xp) * 100}%` }]} />
          </View>
          {today.xp >= cap.xp && <Text style={styles.note}>{t('hub.capReached')}</Text>}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { fontFamily: Fonts.regular, fontSize: 16, lineHeight: 24, color: W.inkSoft, marginTop: -8 },
  notice: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    backgroundColor: W.surface,
    borderWidth: 1,
    borderColor: W.line,
  },
  list: { borderRadius: 16, backgroundColor: W.surface, borderWidth: 1, borderColor: W.line, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, paddingHorizontal: 14, minHeight: 88 },
  rowLine: { borderTopWidth: 1, borderTopColor: W.line },
  name: { fontFamily: FONT, fontSize: 17, letterSpacing: -0.2, color: W.ink },
  tagline: { fontFamily: Fonts.regular, fontSize: 14, lineHeight: 20, color: W.inkSoft },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 5, flexWrap: 'wrap', marginTop: 2 },
  metaText: { fontFamily: Fonts.semibold, fontSize: 13, color: W.muted },
  dot: { width: 3, height: 3, borderRadius: 2, backgroundColor: W.lineStrong, marginHorizontal: 2 },
  ladder: { gap: 10, padding: 16, borderRadius: 16, backgroundColor: W.surface, borderWidth: 1, borderColor: W.line },
  eyebrow: { fontFamily: Fonts.bold, fontSize: 11, letterSpacing: 1.2, color: W.muted },
  scale: { flexDirection: 'row', alignItems: 'flex-end', gap: 4 },
  step: { flex: 1, borderRadius: 3, backgroundColor: W.lineStrong },
  scaleEnds: { flexDirection: 'row', justifyContent: 'space-between' },
  note: { fontFamily: Fonts.regular, fontSize: 14, lineHeight: 20, color: W.inkSoft },
  track: { height: 4, borderRadius: 2, backgroundColor: W.line, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: W.focus },
});
