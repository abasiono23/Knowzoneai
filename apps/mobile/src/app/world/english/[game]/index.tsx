import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';

import { FONT, GradientButton } from '@/components/games/ui';
import { Stars, Wallet } from '@/components/world/world-ui';
import { Card, Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import type { EnglishGameId } from '@/lib/api';
import {
  COVERS,
  ENGLISH_GAMES,
  GAME_COLORS,
  KORA_IMAGE,
  MONSTER_IMAGES,
  MONSTERS,
  playHref,
} from '@/lib/games/english';
import { suggestedLevel, useGamesCatalogue } from '@/lib/games/use-catalogue';

/** One word game: what it is, how to play, and its five levels. */
export default function WordGameScreen() {
  const { t } = useTranslation('games');
  const { game } = useLocalSearchParams<{ game: string }>();
  const { levelsOf, error } = useGamesCatalogue();
  if (!ENGLISH_GAMES.includes(game as EnglishGameId)) return <Redirect href="/world/english" />;
  const id = game as EnglishGameId;
  const levels = levelsOf(id);
  const next = suggestedLevel(levels);
  const colors = GAME_COLORS[id];

  return (
    <Screen withTabBar={false}>
      <ScreenHeader eyebrow={t('hub.title').toUpperCase()} right={<Wallet compact />} />
      <LinearGradient colors={[colors[0], '#1C1668']} start={{ x: 0, y: 0 }} end={{ x: 0.6, y: 1 }} style={styles.hero}>
        <Animated.View entering={ZoomIn.springify()}>
          <Image source={COVERS[id]} style={{ width: 150, height: 150 }} contentFit="contain" accessible={false} />
        </Animated.View>
        <Text style={{ fontFamily: FONT, fontSize: 30, color: '#fff', textAlign: 'center' }}>
          {t(`english.${id}.name`)}
        </Text>
        <Text color="rgba(255,255,255,0.9)" center>
          {t(`english.${id}.tagline`)}
        </Text>
      </LinearGradient>

      <Card style={styles.how}>
        <Image source={KORA_IMAGE} style={{ width: 64, height: 64 }} contentFit="contain" accessible={false} />
        <View style={{ flex: 1, gap: 4 }}>
          <Text variant="label" color={Colors.primary}>
            {t('levels.howToPlay')}
          </Text>
          <Text variant="small" color={Colors.textSecondary}>
            {t(`english.${id}.how`)}
          </Text>
        </View>
      </Card>

      {error && (
        <Text variant="small" color={Colors.textSecondary}>
          {error}
        </Text>
      )}

      <Text variant="heading">{t('levels.title')}</Text>
      {(levels.length
        ? levels
        : [1, 2, 3, 4, 5].map((level) => ({ level, unlocked: level === 1, bestStars: 0, bestScore: 0, plays: 0 }))
      ).map((l) => {
        const monster = MONSTERS[l.level - 1]!;
        const title =
          id === 'spellcaster'
            ? t(`spell.worlds.${monster}.world`)
            : t(`levels.difficulty.${l.level}` as 'levels.difficulty.1');
        return (
          <Pressable
            key={l.level}
            disabled={!l.unlocked || !!error}
            onPress={() => router.push(playHref(id, l.level))}
            accessibilityRole="button"
            accessibilityLabel={`${t('levels.level', { level: l.level })}: ${title}`}
            style={({ pressed }) => [pressed && { transform: [{ scale: 0.98 }] }]}>
            <Card style={[styles.level, !l.unlocked && { opacity: 0.55 }]}>
              {id === 'spellcaster' ? (
                <Image
                  source={MONSTER_IMAGES[monster]}
                  style={{ width: 48, height: 48 }}
                  contentFit="contain"
                  accessible={false}
                />
              ) : (
                <LinearGradient colors={l.unlocked ? colors : ['#2A3060', '#1A2150']} style={styles.badge}>
                  <Text style={{ fontFamily: FONT, fontSize: 20, color: '#fff' }}>{l.level}</Text>
                </LinearGradient>
              )}
              <View style={{ flex: 1, gap: 2 }}>
                <Text variant="label" color={Colors.textMuted}>
                  {t('levels.level', { level: l.level }).toUpperCase()}
                </Text>
                <Text variant="bodyStrong">{title}</Text>
                <Text variant="small" color={Colors.textMuted} style={{ fontSize: 12 }}>
                  {l.unlocked
                    ? l.bestScore
                      ? t('levels.best', { score: l.bestScore })
                      : ' '
                    : t('levels.locked', { level: l.level - 1 })}
                </Text>
              </View>
              {l.unlocked ? (
                <Stars value={l.bestStars} size={16} />
              ) : (
                <Ionicons name="lock-closed" size={20} color={Colors.textMuted} />
              )}
            </Card>
          </Pressable>
        );
      })}

      {!error && (
        <GradientButton
          title={
            levels.find((l) => l.level === next)?.bestStars
              ? t('levels.replay', { level: next })
              : t('levels.play', { level: next })
          }
          icon="play"
          colors={[colors[0], colors[1]]}
          onPress={() => router.push(playHref(id, next))}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', gap: Spacing.xs, padding: Spacing.lg, borderRadius: Radius.xl },
  how: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  level: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.sm },
  badge: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
});
