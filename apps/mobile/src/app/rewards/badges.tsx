import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from '@/components/ui/gradient';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';

import { ChoiceChip } from '@/components/personalize/choice-chip';
import { Button, ProgressBar, Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Gradients, Radius, Spacing } from '@/constants/theme';
import { formatDate, formatNumber } from '@/i18n';
import { getCourse } from '@/lib/courses/catalog';
import { useCourses } from '@/lib/courses/store';
import { useActivity } from '@/lib/rewards/activity';
import { useSession } from '@/lib/session';
import { ACHIEVEMENTS } from '@/lib/world/progress';
import { useWorld } from '@/lib/world/store';

type Badge = {
  id: string;
  group: 'learning' | 'game' | 'courses';
  name: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  value: number;
  target: number;
  earnedAt?: number;
};

const GROUPS = ['all', 'learning', 'game', 'courses'] as const;
type Group = (typeof GROUPS)[number];
type LearningId = 'l-first' | 'l-500' | 'l-2000' | 'l-level5' | 'l-streak3' | 'l-streak7' | 'l-streak30' | 'l-lessons';

/** Screen 160: every badge across the app: learning milestones, game achievements and course certificates. */
export default function BadgesScreen() {
  const { user } = useSession();
  const { facts, achieved } = useWorld();
  const { certificates, done } = useCourses();
  const [now] = useState(() => Date.now());
  const activity = useActivity(now);
  const [group, setGroup] = useState<Group>('all');
  const { t } = useTranslation('rewards');
  const [open, setOpen] = useState<Badge | null>(null);
  if (!user) return null;

  const learningBadge = (b: Omit<Badge, 'name' | 'description' | 'group'> & { id: LearningId }): Badge => ({
    ...b,
    group: 'learning',
    name: t(`badges.list.${b.id}.name`),
    description: t(`badges.list.${b.id}.description`),
  });
  const learning: Badge[] = [
    learningBadge({
      id: 'l-first',
      icon: 'sparkles',
      value: user.xp,
      target: 1,
    }),
    learningBadge({
      id: 'l-500',
      icon: 'star',
      value: user.xp,
      target: 500,
    }),
    learningBadge({
      id: 'l-2000',
      icon: 'trophy',
      value: user.xp,
      target: 2000,
    }),
    learningBadge({
      id: 'l-level5',
      icon: 'trending-up',
      value: user.level,
      target: 5,
    }),
    learningBadge({
      id: 'l-streak3',
      icon: 'flame',
      value: activity.longest,
      target: 3,
    }),
    learningBadge({
      id: 'l-streak7',
      icon: 'bonfire',
      value: activity.longest,
      target: 7,
    }),
    learningBadge({
      id: 'l-streak30',
      icon: 'rocket',
      value: activity.longest,
      target: 30,
    }),
    learningBadge({
      id: 'l-lessons',
      icon: 'book',
      value: Object.keys(done).length,
      target: 10,
    }),
  ];
  const game: Badge[] = ACHIEVEMENTS.map((a) => ({
    id: a.id,
    group: 'game',
    name: a.name,
    description: a.description,
    icon: a.icon,
    value: a.value(facts),
    target: a.target,
    earnedAt: achieved[a.id],
  }));
  const courses: Badge[] = Object.entries(certificates).map(([id, c]) => ({
    id: `c-${id}`,
    group: 'courses',
    name: getCourse(id)?.title ?? t('badges.course'),
    description: t('badges.certificate', { id: c.id }),
    icon: 'ribbon',
    value: 1,
    target: 1,
    earnedAt: c.issuedAt,
  }));
  const all = [...learning, ...game, ...courses];
  const isEarned = (b: Badge) => !!b.earnedAt || b.value >= b.target;
  const shown = all
    .filter((b) => group === 'all' || b.group === group)
    .sort((a, b) => Number(isEarned(b)) - Number(isEarned(a)));
  const earned = all.filter(isEarned).length;

  return (
    <Screen withTabBar={false}>
      <ScreenHeader eyebrow={t('eyebrow')} title={t('badges.title')} />
      <LinearGradient colors={['#2A1B6B', '#6A45FF']} style={styles.hero}>
        <Text style={{ fontSize: 40 }}>🏅</Text>
        <View style={{ flex: 1, gap: 6 }}>
          <Text variant="title" color="#fff">
            {t('badges.earnedOf', { earned, total: all.length })}
          </Text>
          <ProgressBar progress={earned / all.length} height={8} colors={Gradients.reward} />
          <Text variant="small" color="rgba(255,255,255,0.8)">
            {t('badges.earnedLabel')}
          </Text>
        </View>
      </LinearGradient>
      <View style={styles.filters}>
        {GROUPS.map((g) => (
          <ChoiceChip key={g} label={t(`badges.groups.${g}`)} selected={group === g} onPress={() => setGroup(g)} />
        ))}
      </View>
      {group === 'courses' && courses.length === 0 && (
        <Text variant="small" color={Colors.textMuted} center>
          {t('badges.noCourses')}
        </Text>
      )}
      <View style={styles.grid}>
        {shown.map((b, k) => {
          const got = isEarned(b);
          return (
            <Animated.View key={b.id} entering={FadeInDown.delay(Math.min(k, 12) * 25)} style={styles.cell}>
              <Pressable
                onPress={() => setOpen(b)}
                accessibilityRole="button"
                accessibilityLabel={
                  got
                    ? t('badges.a11yEarned', { name: b.name })
                    : t('badges.a11yProgress', { name: b.name, value: Math.min(b.value, b.target), target: b.target })
                }
                style={styles.badge}>
                <LinearGradient
                  colors={got ? Gradients.reward : [Colors.surfaceRaised, Colors.surfaceRaised]}
                  style={styles.medal}>
                  <Ionicons name={b.icon} size={26} color={got ? Colors.onBright : Colors.textMuted} />
                </LinearGradient>
                <Text
                  variant="small"
                  center
                  numberOfLines={2}
                  style={{ fontSize: 12, fontFamily: 'Manrope_600SemiBold' }}
                  color={got ? Colors.text : Colors.textMuted}>
                  {b.name}
                </Text>
                {!got && <ProgressBar progress={Math.min(1, b.value / b.target)} height={4} />}
              </Pressable>
            </Animated.View>
          );
        })}
      </View>
      <Modal visible={!!open} transparent animationType="fade" onRequestClose={() => setOpen(null)}>
        <Pressable
          style={styles.backdrop}
          onPress={() => setOpen(null)}
          accessibilityLabel={t('actions.close', { ns: 'common' })}>
          {open && (
            <Animated.View entering={ZoomIn.duration(200)} style={styles.sheet}>
              <LinearGradient
                colors={isEarned(open) ? Gradients.reward : [Colors.surfaceRaised, Colors.surfaceRaised]}
                style={[styles.medal, { width: 96, height: 96, borderRadius: 48 }]}>
                <Ionicons
                  name={open.icon}
                  size={44}
                  color={isEarned(open) ? Colors.onBright : Colors.textMuted}
                />
              </LinearGradient>
              <Text variant="label" color={Colors.textMuted}>
                {t(`badges.groups.${open.group}`).toUpperCase()}
              </Text>
              <Text variant="title" center>
                {open.name}
              </Text>
              <Text color={Colors.textSecondary} center>
                {open.description}
              </Text>
              {isEarned(open) ? (
                <Text variant="bodyStrong" color={Colors.success}>
                  {open.earnedAt
                    ? t('badges.earnedOn', {
                        date: formatDate(open.earnedAt, { day: 'numeric', month: 'numeric', year: 'numeric' }),
                      })
                    : t('badges.earned')}
                </Text>
              ) : (
                <View style={{ alignSelf: 'stretch', gap: 4 }}>
                  <ProgressBar progress={Math.min(1, open.value / open.target)} height={8} />
                  <Text variant="small" color={Colors.textMuted} center>
                    {t('badges.progress', {
                      value: formatNumber(Math.min(open.value, open.target)),
                      target: formatNumber(open.target),
                    })}
                  </Text>
                </View>
              )}
              <Button
                title={t('actions.close', { ns: 'common' })}
                variant="secondary"
                onPress={() => setOpen(null)}
                style={{ alignSelf: 'stretch' }}
              />
            </Animated.View>
          )}
        </Pressable>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.lg, borderRadius: Radius.xl },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  cell: { width: '31.5%', flexGrow: 1, maxWidth: 160 },
  badge: {
    alignItems: 'center',
    gap: 6,
    padding: Spacing.sm,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 130,
  },
  medal: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(5,8,26,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  sheet: {
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.lg,
    borderRadius: Radius.xl,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
  },
});
