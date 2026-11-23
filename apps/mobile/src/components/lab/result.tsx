import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, ZoomIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { column, FONT, GameBackground, PrimaryButton, SecondaryButton, W } from '@/components/games/ui';
import { Text } from '@/components/ui';
import { Fonts } from '@/constants/theme';
import type { GameSummary } from '@/lib/api';
import { levelKey } from '@/lib/games/english';

import { depthOf, frameOf, ladderOf, WORLD_NS, type ReviewItem, type SubjectGameId, type SubjectWorld } from './contract';
import { SubjectCover } from './covers';

/**
 * The end of a subject game, in the word games' look: the verdict, stars, score and best, rewards, the
 * next level, play again, and a review of what was right or wrong when the game provides one.
 */
export function SubjectResult({
  world,
  game,
  level,
  max = ladderOf(world).max,
  summary: s,
  run,
  onNext,
  onReplay,
  onBack,
}: {
  world: SubjectWorld;
  game: SubjectGameId;
  level: number;
  max?: number;
  summary: GameSummary;
  run?: { id: string; game: string } | null;
  onNext: () => void;
  onReplay: () => void;
  onBack: () => void;
}) {
  const { t } = useTranslation('games');
  const tn = useTranslation(WORLD_NS[world]).t;
  const tw = useTranslation('world').t;
  const { open } = ladderOf(world);
  const title = s.stars >= 3 ? t('results.great') : s.stars > 0 ? t('results.good') : t('results.tryAgain');
  const capped = s.stars > 0 && s.xp === 0 && s.coins === 0;
  let items: ReviewItem[] = [];
  try {
    items = run ? (frameOf(game).review?.(run) ?? []) : [];
  } catch {
    items = [];
  }
  const right = items.filter((i) => i.correct).length;
  // Levels up to OPEN_LEVELS are always open; later ones need a star on this one.
  const canNext = level < max && (s.nextLevelUnlocked || level + 1 <= open);
  const levelName = (l: number) => t(`levels.names.${levelKey(l)}`);
  return (
    <GameBackground>
      <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={[column, styles.result]} showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeIn.duration(200)} style={styles.head}>
            <SubjectCover game={game} size={56} />
            <Text style={styles.eyebrow}>
              {`${tn(`games.${game}.name` as never)} · ${t('ui.levelName', { level, name: levelName(level) })}`.toUpperCase()}
            </Text>
            <Text style={styles.title} accessibilityRole="header">
              {title}
            </Text>
            <View style={styles.stars} accessible accessibilityLabel={t('results.stars', { count: s.stars })}>
              {[0, 1, 2].map((i) => (
                <Animated.View key={i} entering={ZoomIn.delay(150 + i * 120).duration(220)}>
                  <Ionicons name={i < s.stars ? 'star' : 'star-outline'} size={34} color={i < s.stars ? '#E2A100' : W.lineStrong} />
                </Animated.View>
              ))}
            </View>
            <Text style={styles.starsText}>{t('results.stars', { count: s.stars })}</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(250).duration(220)} style={styles.card}>
            <Fact label={t('results.score')} value={String(s.score)} big />
            {items.length > 0 && <Fact label={t('results.right')} value={`${right}/${items.length}`} />}
            <Fact
              label={s.newBest && s.score > 0 ? t('results.newBest') : t('results.bestLabel')}
              value={String(Math.max(s.best.score, s.score))}
            />
          </Animated.View>

          {(s.xp > 0 || s.coins > 0) && (
            <View style={styles.rewards}>
              {s.xp > 0 && (
                <View style={styles.reward}>
                  <Ionicons name="flash" size={16} color={W.focus} />
                  <Text style={styles.rewardText}>{t('results.xp', { count: s.xp })}</Text>
                </View>
              )}
              {s.coins > 0 && (
                <View style={styles.reward}>
                  <Ionicons name="ellipse" size={14} color="#E2A100" />
                  <Text style={styles.rewardText}>{t('results.coins', { count: s.coins })}</Text>
                </View>
              )}
            </View>
          )}
          {capped && <Text style={styles.note}>{t('results.capped')}</Text>}
          {canNext && level + 1 > open && s.stars > 0 && (
            <View style={styles.unlocked}>
              <Ionicons name="lock-open-outline" size={18} color={W.correct} />
              <Text style={{ fontFamily: Fonts.bold, color: W.correct }}>{t('results.unlocked', { level: level + 1 })}</Text>
            </View>
          )}

          <View style={{ gap: 10 }}>
            {canNext && (
              <PrimaryButton
                title={`${t('results.next')}: ${levelName(level + 1)} · ${tw(`subjectHub.depth.${depthOf(level + 1)}`)}`}
                icon="arrow-forward"
                onPress={onNext}
              />
            )}
            {canNext ? (
              <SecondaryButton title={t('results.replay')} icon="refresh" onPress={onReplay} />
            ) : (
              <PrimaryButton title={t('results.replay')} icon="refresh" onPress={onReplay} />
            )}
            <Pressable onPress={onBack} accessibilityRole="button" style={styles.link} hitSlop={8}>
              <Text style={styles.linkText}>{tw('subjectHub.backToLevels')}</Text>
            </Pressable>
          </View>

          {items.length > 0 && (
            <View style={{ gap: 8 }}>
              <Text style={styles.eyebrow}>{t('results.review').toUpperCase()}</Text>
              <View style={styles.list}>
                {items.map((item, k) => (
                  <View key={item.key} style={[styles.item, k > 0 && styles.itemLine]}>
                    <Ionicons
                      name={item.correct ? 'checkmark-circle' : 'close-circle'}
                      size={20}
                      color={item.correct ? W.correct : W.wrong}
                      accessibilityLabel={item.correct ? t('ui.correct') : t('ui.wrong')}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemMain}>{item.main}</Text>
                      {!!item.detail && <Text style={styles.itemDetail}>{item.detail}</Text>}
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </GameBackground>
  );
}

function Fact({ label, value, big }: { label: string; value: string; big?: boolean }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', gap: 2 }} accessible accessibilityLabel={`${label}: ${value}`}>
      <Text style={{ fontFamily: FONT, fontSize: big ? 30 : 24, color: W.ink, fontVariant: ['tabular-nums'] }}>{value}</Text>
      <Text style={{ fontFamily: Fonts.semibold, fontSize: 13, color: W.muted, textAlign: 'center' }} numberOfLines={2}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  result: { padding: 20, gap: 20, paddingBottom: 40 },
  head: { alignItems: 'center', gap: 8, paddingTop: 8 },
  eyebrow: { fontFamily: Fonts.bold, fontSize: 11, letterSpacing: 1.2, color: W.muted, textAlign: 'center' },
  title: { fontFamily: FONT, fontSize: 30, lineHeight: 36, letterSpacing: -0.6, color: W.ink, textAlign: 'center' },
  stars: { flexDirection: 'row', gap: 8, marginTop: 4 },
  starsText: { fontFamily: Fonts.semibold, fontSize: 14, color: W.inkSoft },
  card: {
    flexDirection: 'row',
    paddingVertical: 18,
    paddingHorizontal: 8,
    borderRadius: 16,
    backgroundColor: W.surface,
    borderWidth: 1,
    borderColor: W.line,
  },
  rewards: { flexDirection: 'row', justifyContent: 'center', gap: 10, flexWrap: 'wrap' },
  reward: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: W.surface,
    borderWidth: 1,
    borderColor: W.line,
  },
  rewardText: { fontFamily: Fonts.bold, fontSize: 14, color: W.ink },
  note: { fontFamily: Fonts.regular, fontSize: 14, color: W.inkSoft, textAlign: 'center' },
  unlocked: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  link: { alignSelf: 'center', paddingVertical: 10, paddingHorizontal: 16, minHeight: 44, justifyContent: 'center' },
  linkText: { fontFamily: Fonts.bold, fontSize: 15, color: W.inkSoft, textDecorationLine: 'underline' },
  list: { borderRadius: 14, backgroundColor: W.surface, borderWidth: 1, borderColor: W.line },
  item: { flexDirection: 'row', gap: 10, padding: 12, alignItems: 'flex-start' },
  itemLine: { borderTopWidth: 1, borderTopColor: W.line },
  itemMain: { fontFamily: Fonts.bold, fontSize: 15, color: W.ink, letterSpacing: 0.3 },
  itemDetail: { fontFamily: Fonts.regular, fontSize: 14, lineHeight: 20, color: W.inkSoft },
});
