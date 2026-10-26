import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { ProgressRing } from '@/components/courses/progress-ring';
import { Card, ProgressBar, Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { formatNumber } from '@/i18n';
import { REWARDS, rewardName } from '@/lib/rewards/catalog';
import { CATEGORY_META, describeReason, type TxnCategory } from '@/lib/rewards/describe';
import { useRewards } from '@/lib/rewards/store';
import { useSession } from '@/lib/session';

const XP_PER_LEVEL = 250;
/** Level names in order; the text is `rewards:level.names.<id>`. */
const NAMES = [
  'newcomer',
  'learner',
  'curious',
  'explorer',
  'achiever',
  'scholar',
  'trailblazer',
  'expert',
  'master',
  'legend',
] as const;
const levelNameId = (n: number) => NAMES[Math.min(n, NAMES.length) - 1];

/** Screen 159: XP, your level and what each level unlocks. */
export default function XpLevelScreen() {
  const { user } = useSession();
  const { wallet } = useRewards();
  const { t } = useTranslation('rewards');
  const levelName = (n: number) => t(`level.names.${levelNameId(n)}`);
  if (!user) return null;
  const into = user.xp % XP_PER_LEVEL;
  const byCategory = Object.entries(
    (wallet?.transactions ?? [])
      .filter((t) => t.xp > 0 && t.reason !== 'opening')
      .reduce<Record<string, number>>((acc, t) => {
        const c = describeReason(t.reason).category;
        acc[c] = (acc[c] ?? 0) + t.xp;
        return acc;
      }, {}),
  ).sort(([, a], [, b]) => b - a);
  const earnedHere = byCategory.reduce((n, [, v]) => n + v, 0);
  const levels = Array.from({ length: 10 }, (_, k) => k + 1);

  return (
    <Screen withTabBar={false}>
      <ScreenHeader eyebrow={t('eyebrow')} title={t('level.title')} />
      <Card style={styles.hero}>
        <ProgressRing progress={user.levelProgress} size={150} stroke={14} colors={[Colors.primary, '#B04CFF']}>
          <Text variant="label" color={Colors.textMuted}>
            {t('level.label')}
          </Text>
          <Text style={styles.level}>{user.level}</Text>
        </ProgressRing>
        <Text variant="title">{levelName(user.level)}</Text>
        <Text color={Colors.textSecondary}>
          {t('level.progress', { into, per: XP_PER_LEVEL, left: XP_PER_LEVEL - into, next: user.level + 1 })}
        </Text>
        <Text variant="small" color={Colors.textMuted}>
          {t('level.total', { xp: formatNumber(user.xp) })}
        </Text>
      </Card>

      {byCategory.length > 0 && (
        <Card style={{ gap: Spacing.sm }}>
          <Text variant="heading">{t('level.sources')}</Text>
          {byCategory.map(([c, v]) => {
            const m = CATEGORY_META[c as TxnCategory];
            return (
              <View key={c} style={{ gap: 4 }}>
                <View style={styles.between}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Ionicons name={m.icon} size={14} color={m.color} />
                    <Text variant="small">{t(`categories.${c as TxnCategory}`)}</Text>
                  </View>
                  <Text variant="small" color={Colors.textSecondary}>
                    {t('level.xp', { xp: v })}
                  </Text>
                </View>
                <ProgressBar progress={v / earnedHere} height={6} colors={[m.color, m.color]} />
              </View>
            );
          })}
        </Card>
      )}

      <View style={{ gap: Spacing.sm }}>
        <Text variant="heading">{t('level.road')}</Text>
        {levels.map((n) => {
          const reached = user.level >= n;
          const current = user.level === n;
          const unlocks = REWARDS.filter((r) => r.minLevel === n);
          return (
            <View key={n} style={styles.step}>
              <View style={styles.rail}>
                <View style={[styles.node, reached && styles.nodeOn, current && styles.nodeNow]}>
                  {reached && !current ? (
                    <Ionicons name="checkmark" size={14} color={Colors.backgroundDeep} />
                  ) : (
                    <Text variant="label">{n}</Text>
                  )}
                </View>
                {n < 10 && <View style={[styles.line, user.level > n && { backgroundColor: Colors.primary }]} />}
              </View>
              <View style={[styles.info, current && styles.infoNow]}>
                <Text variant="bodyStrong" color={reached ? Colors.text : Colors.textMuted}>
                  {t('level.step', { level: n, name: levelName(n) })}
                </Text>
                <Text variant="small" color={Colors.textMuted} style={{ fontSize: 12 }}>
                  {t('level.xp', { xp: formatNumber((n - 1) * XP_PER_LEVEL) })}
                </Text>
                {unlocks.map((r) => (
                  <Pressable
                    key={r.id}
                    onPress={() => router.push(`/rewards/${r.id}` as Href)}
                    accessibilityRole="link"
                    style={styles.unlock}>
                    <Text style={{ fontSize: 14 }}>{r.emoji}</Text>
                    <Text
                      variant="small"
                      color={reached ? Colors.reward : Colors.textSecondary}
                      style={{ fontSize: 12 }}>
                      {t('level.unlocks', { name: rewardName(r) })}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', gap: Spacing.xs, paddingVertical: Spacing.lg },
  level: { fontFamily: 'Manrope_800ExtraBold', fontSize: 44, lineHeight: 50, color: Colors.text },
  between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  step: { flexDirection: 'row', gap: Spacing.sm },
  rail: { alignItems: 'center', width: 30 },
  node: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeOn: { backgroundColor: Colors.primary },
  nodeNow: { backgroundColor: Colors.reward },
  line: { width: 3, flex: 1, minHeight: 18, backgroundColor: Colors.surfaceRaised },
  info: { flex: 1, gap: 2, padding: Spacing.sm, marginBottom: Spacing.xs, borderRadius: Radius.md },
  infoNow: { backgroundColor: Colors.rewardSoft, borderWidth: 1, borderColor: Colors.reward + '66' },
  unlock: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});
