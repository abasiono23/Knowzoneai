import { Ionicons } from '@expo/vector-icons';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Switch, View } from 'react-native';

import { GameCover } from '@/components/games/cover';
import { HowToPlay } from '@/components/games/how-to';
import { FONT, PrimaryButton, W } from '@/components/games/ui';
import { Wallet } from '@/components/world/world-ui';
import { Screen, ScreenHeader, Text } from '@/components/ui';
import { Fonts } from '@/constants/theme';
import type { EnglishGameId, GameLevel } from '@/lib/api';
import {
  CEFR,
  ENGLISH_GAMES,
  GAME_ACCENT,
  LEVEL_KEYS,
  levelKey,
  MAX_LEVEL,
  OPEN_LEVELS,
  playHref,
  useRelaxed,
} from '@/lib/games/english';
import { suggestedLevel, useGamesCatalogue } from '@/lib/games/use-catalogue';

/** One word game: what it is, how to play, the timer, and its ten levels. */
export default function WordGameScreen() {
  const { t } = useTranslation('games');
  const { game } = useLocalSearchParams<{ game: string }>();
  const { levelsOf, error } = useGamesCatalogue();
  const { relaxed, setRelaxed } = useRelaxed();
  if (!ENGLISH_GAMES.includes(game as EnglishGameId)) return <Redirect href="/world/english" />;
  const id = game as EnglishGameId;
  const loaded = levelsOf(id);
  // Before the catalogue arrives, show the ladder with the open levels.
  const levels: GameLevel[] = loaded.length
    ? loaded
    : LEVEL_KEYS.map((_, i) => ({ level: i + 1, unlocked: i < OPEN_LEVELS, bestStars: 0, bestScore: 0, plays: 0 }));
  const next = suggestedLevel(loaded);
  const nextName = t(`levels.names.${levelKey(next)}`);

  return (
    <Screen withTabBar={false}>
      <ScreenHeader eyebrow={t('hub.title').toUpperCase()} right={<Wallet compact />} />
      <View style={styles.hero}>
        <GameCover game={id} size={76} />
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={styles.title} accessibilityRole="header">
            {t(`english.${id}.name`)}
          </Text>
          <Text style={styles.tagline}>{t(`english.${id}.tagline`)}</Text>
        </View>
      </View>

      {error ? (
        <View style={styles.card}>
          <Text style={styles.body}>{error}</Text>
        </View>
      ) : (
        <View style={{ gap: 12 }}>
          <PrimaryButton
            title={`${levels.find((l) => l.level === next)?.bestStars ? t('levels.replay', { level: next }) : t('levels.play', { level: next })} · ${nextName}`}
            icon="arrow-forward"
            onPress={() => router.push(playHref(id, next))}
          />
          <View style={styles.timer}>
            <Ionicons name={relaxed ? 'infinite' : 'time-outline'} size={20} color={W.ink} />
            <View style={{ flex: 1 }}>
              <Text style={styles.timerTitle}>{t('levels.timer')}</Text>
              <Text style={styles.small}>{relaxed ? t('levels.timerOff') : t('levels.timerOn')}</Text>
            </View>
            <Switch
              value={!relaxed}
              onValueChange={(on) => setRelaxed(!on)}
              trackColor={{ true: W.ink, false: W.lineStrong }}
              thumbColor="#fff"
              accessibilityLabel={t('levels.timer')}
              accessibilityHint={relaxed ? t('levels.timerOff') : t('levels.timerOn')}
            />
          </View>
        </View>
      )}

      <View style={{ gap: 10 }}>
        <Text style={styles.section}>{t('levels.title')}</Text>
        <Text style={styles.small}>{t('levels.openNote', { open: OPEN_LEVELS })}</Text>
        <View style={styles.list}>
          {levels.slice(0, MAX_LEVEL).map((l, k) => (
            <LevelRow key={l.level} game={id} l={l} first={k === 0} disabled={!!error} />
          ))}
        </View>
      </View>

      <View style={{ gap: 12 }}>
        <Text style={styles.section}>{t('levels.howToPlay')}</Text>
        <View style={styles.card}>
          <HowToPlay game={id} />
        </View>
      </View>
    </Screen>
  );
}

function LevelRow({ game, l, first, disabled }: { game: EnglishGameId; l: GameLevel; first: boolean; disabled: boolean }) {
  const { t } = useTranslation('games');
  const key = levelKey(l.level);
  const name = t(`levels.names.${key}`);
  const cefr = CEFR[l.level - 1];
  const status = l.unlocked
    ? `${t('levels.starsA11y', { count: l.bestStars })}${l.bestScore ? `. ${t('levels.best', { score: l.bestScore })}` : ''}`
    : t('levels.locked', { level: l.level - 1 });
  return (
    <Pressable
      disabled={!l.unlocked || disabled}
      onPress={() => router.push(playHref(game, l.level))}
      accessibilityRole="button"
      accessibilityLabel={`${t('levels.level', { level: l.level })}: ${name}, ${cefr}. ${t(`levels.about.${key}`)}. ${status}`}
      accessibilityState={{ disabled: !l.unlocked || disabled }}
      style={({ pressed }) => [styles.level, !first && styles.levelLine, pressed && { backgroundColor: W.page }]}>
      <View
        style={[
          styles.badge,
          l.bestStars > 0 && { backgroundColor: GAME_ACCENT[game], borderColor: GAME_ACCENT[game] },
          !l.unlocked && { borderColor: W.line },
        ]}>
        <Text style={[styles.badgeText, l.bestStars > 0 && { color: '#fff' }, !l.unlocked && { color: W.muted }]}>{l.level}</Text>
      </View>
      <View style={{ flex: 1, gap: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <Text style={[styles.levelName, !l.unlocked && { color: W.muted }]}>{name}</Text>
          <View style={styles.cefr}>
            <Text style={styles.cefrText}>{cefr}</Text>
          </View>
        </View>
        <Text style={styles.small}>{l.unlocked ? t(`levels.about.${key}`) : t('levels.locked', { level: l.level - 1 })}</Text>
      </View>
      {l.unlocked ? (
        <View style={{ flexDirection: 'row', gap: 2 }}>
          {[0, 1, 2].map((i) => (
            <Ionicons key={i} name={i < l.bestStars ? 'star' : 'star-outline'} size={15} color={i < l.bestStars ? '#E2A100' : W.lineStrong} />
          ))}
        </View>
      ) : (
        <Ionicons name="lock-closed-outline" size={18} color={W.muted} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hero: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  title: { fontFamily: FONT, fontSize: 28, lineHeight: 34, letterSpacing: -0.6, color: W.ink },
  tagline: { fontFamily: Fonts.regular, fontSize: 15, lineHeight: 22, color: W.inkSoft },
  card: { padding: 16, borderRadius: 16, backgroundColor: W.surface, borderWidth: 1, borderColor: W.line },
  body: { fontFamily: Fonts.regular, fontSize: 15, lineHeight: 22, color: W.ink },
  timer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 14,
    backgroundColor: W.surface,
    borderWidth: 1,
    borderColor: W.line,
  },
  timerTitle: { fontFamily: Fonts.bold, fontSize: 15, color: W.ink },
  small: { fontFamily: Fonts.regular, fontSize: 13, lineHeight: 18, color: W.inkSoft },
  section: { fontFamily: FONT, fontSize: 18, letterSpacing: -0.2, color: W.ink },
  list: { borderRadius: 16, backgroundColor: W.surface, borderWidth: 1, borderColor: W.line, overflow: 'hidden' },
  level: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 14, minHeight: 64 },
  levelLine: { borderTopWidth: 1, borderTopColor: W.line },
  badge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    borderColor: W.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { fontFamily: FONT, fontSize: 14, color: W.ink },
  levelName: { fontFamily: Fonts.bold, fontSize: 15, color: W.ink },
  cefr: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4, backgroundColor: W.given },
  cefrText: { fontFamily: Fonts.bold, fontSize: 11, color: W.inkSoft, letterSpacing: 0.4 },
});
