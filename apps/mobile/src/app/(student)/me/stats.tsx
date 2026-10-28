import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { ProgressRing } from '@/components/courses/progress-ring';
import { Card, ProgressBar, Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Gradients, Radius, Spacing } from '@/constants/theme';
import { formatDate, formatNumber } from '@/i18n';
import { getCourse } from '@/lib/courses/catalog';
import { useCourses } from '@/lib/courses/store';
import { useActivity } from '@/lib/rewards/activity';
import { useSession } from '@/lib/session';
import { useMaterials } from '@/lib/studio/store';
import { useVideos } from '@/lib/videos/store';
import { WORLDS } from '@/lib/world/content';
import { dayKey } from '@/lib/world/levels';
import { useWorld } from '@/lib/world/store';

/** Screen 180: learning statistics, from every part of the app. */
export default function LearningStatsScreen() {
  const { user } = useSession();
  const [now] = useState(() => Date.now());
  const activity = useActivity(now);
  const { materials } = useMaterials();
  const { generated } = useVideos();
  const courses = useCourses();
  const world = useWorld();
  const { t } = useTranslation('settings');
  if (!user) return null;
  const pct = (x: number) => formatNumber(x, { style: 'percent', maximumFractionDigits: 0 });

  const packs = materials.filter((m) => m.status === 'ready');
  const packQuizzes = materials.flatMap((m) => m.attempts);
  const packAcc = packQuizzes.length
    ? packQuizzes.reduce((n, a) => n + a.score / a.total, 0) / packQuizzes.length
    : null;
  const cardsReviewed = materials.reduce((n, m) => n + Object.values(m.cards).reduce((k, c) => k + c.reviews, 0), 0);
  const courseAttempts = Object.values(courses.attempts).flat();
  const courseAcc = courseAttempts.length
    ? courseAttempts.reduce((n, a) => n + a.score / a.total, 0) / courseAttempts.length
    : null;
  const minutes = Object.values(courses.minutes).reduce((n, m) => n + m, 0);
  const allAcc = [...packQuizzes.map((a) => a.score / a.total), ...courseAttempts.map((a) => a.score / a.total)];
  const accuracy = allAcc.length ? allAcc.reduce((n, a) => n + a, 0) / allAcc.length : null;
  const week = Array.from({ length: 7 }, (_, k) => {
    const at = now - (6 - k) * 86400000;
    return {
      key: dayKey(at),
      label: formatDate(at, { weekday: 'narrow' }),
      on: activity.active.has(dayKey(at)),
    };
  });
  const enrolled = Object.keys(courses.enrolled)
    .map(getCourse)
    .filter((c) => !!c);

  return (
    <Screen withTabBar={false}>
      <ScreenHeader eyebrow={t('me.eyebrow')} title={t('stats.title')} />
      <Card style={styles.hero}>
        <ProgressRing progress={user.levelProgress} size={110} stroke={10}>
          <Text variant="label" color={Colors.textMuted}>
            {t('stats.level')}
          </Text>
          <Text variant="title">{user.level}</Text>
        </ProgressRing>
        <View style={{ flex: 1, gap: Spacing.xs }}>
          <Metric icon="flash" color={Colors.primary} value={formatNumber(user.xp)} label={t('stats.xpEarned')} />
          <Metric
            icon="flame"
            color="#FF9F43"
            value={t('time.days', { ns: 'common', count: activity.current })}
            label={t('stats.streakBest', { best: activity.longest })}
          />
          <Metric
            icon="checkmark-done"
            color={Colors.success}
            value={accuracy === null ? '—' : pct(accuracy)}
            label={t('stats.quizAccuracy')}
          />
        </View>
      </Card>

      <Card style={{ gap: Spacing.sm }}>
        <View style={styles.between}>
          <Text variant="heading">{t('stats.thisWeek')}</Text>
          <Text variant="small" color={Colors.textSecondary}>
            {t('stats.daysOfWeek', { count: week.filter((d) => d.on).length })}
          </Text>
        </View>
        <View style={styles.week}>
          {week.map((d) => (
            <View key={d.key} style={{ alignItems: 'center', gap: 4 }}>
              <View style={[styles.day, d.on && styles.dayOn]}>
                {d.on && <Ionicons name="checkmark" size={14} color={Colors.onBright} />}
              </View>
              <Text variant="small" color={Colors.textMuted} style={{ fontSize: 11 }}>
                {d.label}
              </Text>
            </View>
          ))}
        </View>
        <Text variant="small" color={Colors.textMuted} style={{ fontSize: 12 }}>
          {t('stats.totals', { count: activity.total, minutes: user.dailyGoalMinutes })}
        </Text>
      </Card>

      <View style={styles.grid}>
        <Tile
          icon="layers"
          color={Colors.primary}
          value={packs.length}
          label={t('stats.tiles.packs', { count: packs.length })}
          href="/me/saved"
        />
        <Tile
          icon="help-circle"
          color={Colors.danger}
          value={packQuizzes.length + courseAttempts.length}
          label={t('stats.tiles.quizzes', { count: packQuizzes.length + courseAttempts.length })}
        />
        <Tile
          icon="albums"
          color={Colors.reward}
          value={cardsReviewed}
          label={t('stats.tiles.cards', { count: cardsReviewed })}
        />
        <Tile
          icon="videocam"
          color={Colors.info}
          value={generated.filter((v) => v.status === 'ready').length}
          label={t('stats.tiles.videos', { count: generated.filter((v) => v.status === 'ready').length })}
          href="/me/videos"
        />
        <Tile
          icon="school"
          color={Colors.success}
          value={Object.keys(courses.done).length}
          label={t('stats.tiles.lessons', { count: Object.keys(courses.done).length })}
          href="/me/courses"
        />
        <Tile icon="time" color="#FF9F43" value={minutes} label={t('stats.tiles.minutes', { count: minutes })} />
      </View>

      <Card style={{ gap: Spacing.sm }}>
        <Text variant="heading">{t('stats.courses')}</Text>
        {enrolled.length === 0 && (
          <Text variant="small" color={Colors.textMuted}>
            {t('stats.noCourses')}
          </Text>
        )}
        {enrolled.map((c) => {
          const p = courses.progressOf(c);
          return (
            <View key={c.id} style={{ gap: 4 }}>
              <View style={styles.between}>
                <Text variant="small" numberOfLines={1} style={{ flex: 1 }}>
                  {c.emoji} {c.title}
                </Text>
                <Text variant="small" color={p.complete ? Colors.success : Colors.textSecondary}>
                  {pct(p.pct)}
                </Text>
              </View>
              <ProgressBar progress={p.pct} height={6} colors={p.complete ? Gradients.mastery : Gradients.ai} />
            </View>
          );
        })}
        {courseAcc !== null && (
          <Text variant="small" color={Colors.textMuted} style={{ fontSize: 12 }}>
            {t('stats.courseAverage', { value: pct(courseAcc) })}
          </Text>
        )}
      </Card>

      <Card style={{ gap: Spacing.sm }}>
        <View style={styles.between}>
          <Text variant="heading">Knowzone World</Text>
          <Text variant="small" color={Colors.textSecondary}>
            {world.totalStars} ★
          </Text>
        </View>
        {WORLDS.filter((w) => world.isWorldUnlocked(w)).map((w) => (
          <View key={w.id} style={{ gap: 4 }}>
            <View style={styles.between}>
              <Text variant="small">
                {w.emoji} {w.name}
              </Text>
              <Text variant="small" color={Colors.textSecondary}>
                {world.worldStars(w.id)}/18
              </Text>
            </View>
            <ProgressBar progress={world.worldStars(w.id) / 18} height={6} colors={Gradients.reward} />
          </View>
        ))}
      </Card>

      {packAcc !== null && (
        <Card style={styles.row}>
          <Ionicons name="trending-up" size={20} color={Colors.success} />
          <Text variant="small" style={{ flex: 1 }}>
            {t('stats.packAverage', { value: pct(packAcc) })}
          </Text>
        </Card>
      )}
    </Screen>
  );
}

function Metric({
  icon,
  color,
  value,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  value: string;
  label: string;
}) {
  return (
    <View style={styles.row}>
      <Ionicons name={icon} size={16} color={color} />
      <Text variant="bodyStrong">{value}</Text>
      <Text variant="small" color={Colors.textMuted} style={{ fontSize: 12, flexShrink: 1 }}>
        {label}
      </Text>
    </View>
  );
}

function Tile({
  icon,
  color,
  value,
  label,
  href,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  value: number;
  label: string;
  href?: string;
}) {
  const { t } = useTranslation('settings');
  const body = (
    <View style={styles.tile}>
      <Ionicons name={icon} size={20} color={color} />
      <Text variant="title">{formatNumber(value)}</Text>
      <Text variant="small" color={Colors.textMuted} style={{ fontSize: 12 }}>
        {label}
      </Text>
    </View>
  );
  return (
    <View style={styles.tileWrap}>
      {href ? (
        <Pressable
          onPress={() => router.push(href as Href)}
          accessibilityRole="button"
          accessibilityLabel={t('stats.tileA11y', { value: formatNumber(value), label })}>
          {body}
        </Pressable>
      ) : (
        body
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: Spacing.sm },
  week: { flexDirection: 'row', justifyContent: 'space-between' },
  day: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayOn: { backgroundColor: '#FF9F43' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  tileWrap: { width: '31.5%', flexGrow: 1 },
  tile: {
    gap: 2,
    padding: Spacing.sm,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
});
