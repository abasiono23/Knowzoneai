import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { FONT } from '@/components/games/ui';
import { Stars, Wallet } from '@/components/world/world-ui';
import { Card, ProgressBar, Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Gradients, Radius, Spacing } from '@/constants/theme';
import { useFlipStyle } from '@/i18n/provider';
import { COVERS, ENGLISH_GAMES, GAME_COLORS, gameHref, KORA_IMAGE, MAX_LEVEL } from '@/lib/games/english';
import { suggestedLevel, useGamesCatalogue } from '@/lib/games/use-catalogue';

/** Word games hub (Language Island): the five English games, your stars, and today's rewards. */
export default function WordGamesHub() {
  const { t } = useTranslation('games');
  const flip = useFlipStyle();
  const { data, error, levelsOf } = useGamesCatalogue();
  const today = data?.rewardsToday;
  const cap = data?.dailyCap;

  return (
    <Screen withTabBar={false}>
      <ScreenHeader
        eyebrow={t('hub.eyebrow')}
        title={t('hub.title')}
        eyebrowColor={Colors.success}
        right={<Wallet compact />}
      />

      <LinearGradient colors={['#1663C7', '#7C5CFF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        <Image source={KORA_IMAGE} style={{ width: 92, height: 92 }} contentFit="contain" accessible={false} />
        <View style={{ flex: 1, gap: Spacing.xs }}>
          <Text color="#fff" style={{ fontFamily: 'Manrope_700Bold' }}>
            {t('hub.intro')}
          </Text>
          {today && cap && (
            <View style={{ gap: 4 }}>
              <Text variant="small" color="rgba(255,255,255,0.85)">
                {t('hub.today', { xp: today.xp, cap: cap.xp })}
              </Text>
              <ProgressBar progress={today.xp / cap.xp} height={6} colors={Gradients.reward} />
            </View>
          )}
        </View>
      </LinearGradient>
      {today && cap && today.xp >= cap.xp && (
        <Text variant="small" color={Colors.textSecondary}>
          {t('hub.capReached')}
        </Text>
      )}
      {error && (
        <Card style={{ flexDirection: 'row', gap: Spacing.sm, alignItems: 'center' }}>
          <Ionicons name="cloud-offline" size={22} color={Colors.textMuted} />
          <Text variant="small" color={Colors.textSecondary} style={{ flex: 1 }}>
            {error}
          </Text>
        </Card>
      )}

      {ENGLISH_GAMES.map((game, k) => {
        const levels = levelsOf(game);
        const stars = levels.reduce((s, l) => s + l.bestStars, 0);
        const level = suggestedLevel(levels);
        return (
          <Animated.View key={game} entering={FadeInDown.delay(k * 70)}>
            <Pressable
              onPress={() => router.push(gameHref(game))}
              accessibilityRole="button"
              accessibilityLabel={`${t(`english.${game}.name`)}. ${t(`english.${game}.tagline`)}`}
              style={({ pressed }) => [pressed && { transform: [{ scale: 0.98 }] }]}>
              <LinearGradient
                colors={[GAME_COLORS[game][0] + '40', '#141A45']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.card, { borderColor: GAME_COLORS[game][0] + '66' }]}>
                <Image source={COVERS[game]} style={styles.cover} contentFit="contain" accessible={false} />
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={{ fontFamily: FONT, fontSize: 19, color: '#fff' }}>{t(`english.${game}.name`)}</Text>
                  <Text variant="small" color={Colors.textSecondary}>
                    {t(`english.${game}.tagline`)}
                  </Text>
                  <View style={styles.meta}>
                    <Stars value={Math.round((stars / (MAX_LEVEL * 3)) * 3)} size={13} />
                    <Text variant="small" color={Colors.textMuted} style={{ fontSize: 12 }}>
                      {t('hub.stars', { count: stars, max: MAX_LEVEL * 3 })}
                    </Text>
                    <View style={[styles.levelChip, { backgroundColor: GAME_COLORS[game][0] + '33' }]}>
                      <Text variant="label" style={{ fontSize: 10 }} color={GAME_COLORS[game][1]}>
                        {t('hub.levelOf', { level, max: MAX_LEVEL })}
                      </Text>
                    </View>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} style={flip} />
              </LinearGradient>
            </Pressable>
          </Animated.View>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.md, borderRadius: Radius.xl },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.sm,
    paddingRight: Spacing.md,
    borderRadius: Radius.xl,
    borderWidth: 1,
  },
  cover: { width: 88, height: 88 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginTop: 2 },
  levelChip: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
});
