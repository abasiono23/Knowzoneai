import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, Share, StyleSheet, View } from 'react-native';

import { Button, Card, ProgressBar, Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Gradients, Radius, Spacing } from '@/constants/theme';
import { formatNumber } from '@/i18n';
import { subjectLabel } from '@/lib/personalization';
import { isPast, relativeDue, teacherApi, type ClassDetail } from '@/lib/teacher';

const TABS = ['insights', 'students', 'assignments'] as const;

const masteryColor = (m: number) => (m >= 0.75 ? Colors.success : m >= 0.55 ? Colors.reward : Colors.danger);
const pct = (n: number) => formatNumber(n, { style: 'percent', maximumFractionDigits: 0 });
const daysAgo = (iso: string, t: TFunction<'teacher'>) => {
  const d = Math.round((Date.now() - new Date(iso).getTime()) / 86_400_000);
  return d === 0
    ? t('classDetail.activeToday')
    : d === 1
      ? t('classDetail.activeYesterday')
      : t('classDetail.activeDaysAgo', { count: d });
};

export default function ClassDetailScreen() {
  const { t } = useTranslation('teacher');
  const { id } = useLocalSearchParams<{ id: string }>();
  const [c, setC] = useState<ClassDetail | null>(null);
  const [tab, setTab] = useState<(typeof TABS)[number]>('insights');

  useFocusEffect(
    useCallback(() => {
      teacherApi
        .classDetail(id)
        .then((r) => setC(r.class))
        .catch(() => {});
    }, [id]),
  );

  if (!c) {
    return (
      <Screen withTabBar={false}>
        <ScreenHeader />
        <ActivityIndicator color={Colors.primary} />
      </Screen>
    );
  }

  const assign = (topic?: string) =>
    router.push({ pathname: '/assignment/new', params: { classId: c.id, ...(topic ? { topic } : {}) } });

  return (
    <Screen withTabBar={false}>
      <ScreenHeader eyebrow={subjectLabel(c.subject).toUpperCase()} title={c.name} />

      <LinearGradient
        colors={[c.color, c.color + '88']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}>
        <View style={styles.heroStats}>
          <HeroStat
            value={formatNumber(c.studentCount)}
            label={t('classDetail.heroStudents', { count: c.studentCount })}
          />
          <HeroStat value={pct(c.avgMastery)} label={t('classDetail.heroMastery')} />
          <HeroStat
            value={formatNumber(c.activeAssignments)}
            label={t('classDetail.heroActive', { count: c.activeAssignments })}
          />
        </View>
        <Pressable
          onPress={() => Share.share({ message: t('classDetail.shareMessage', { name: c.name, code: c.joinCode }) })}
          accessibilityRole="button"
          accessibilityLabel={t('classDetail.shareA11y', { code: c.joinCode })}
          style={styles.code}>
          <Ionicons name="key" size={16} color={Colors.text} />
          <Text variant="bodyStrong" style={{ letterSpacing: 2 }}>
            {c.joinCode}
          </Text>
          <Ionicons name="share-social" size={16} color={Colors.text} />
        </Pressable>
      </LinearGradient>

      <View style={styles.segment}>
        {TABS.map((k) => (
          <Pressable
            key={k}
            onPress={() => setTab(k)}
            accessibilityRole="tab"
            accessibilityLabel={t(`classDetail.tabs.${k}`)}
            accessibilityState={{ selected: tab === k }}
            style={[styles.segmentItem, tab === k && styles.segmentActive]}>
            <Text variant="small" color={tab === k ? Colors.text : Colors.textSecondary}>
              {t(`classDetail.tabs.${k}`)}
            </Text>
          </Pressable>
        ))}
      </View>

      {c.studentCount === 0 && (
        <Card style={{ gap: Spacing.xs }}>
          <Text variant="bodyStrong">{t('classDetail.noStudents')}</Text>
          <Text variant="small" color={Colors.textSecondary}>
            {t('classDetail.noStudentsHint', { code: c.joinCode })}
          </Text>
        </Card>
      )}

      {tab === 'insights' && c.studentCount > 0 && (
        <View style={{ gap: Spacing.md }}>
          {c.gaps.length > 0 && (
            <View style={{ gap: Spacing.sm }}>
              <Text variant="heading">{t('classDetail.gaps')}</Text>
              {c.gaps.map((g) => (
                <Card key={g.topic} style={{ gap: Spacing.sm, borderColor: Colors.danger + '55' }}>
                  <View style={styles.rowBetween}>
                    <Text variant="bodyStrong">{g.topic}</Text>
                    <View style={styles.pill}>
                      <Text variant="label" color={Colors.danger}>
                        {t('classDetail.struggling', { n: formatNumber(g.studentsStruggling) })}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.tip}>
                    <Ionicons name="sparkles" size={16} color={Colors.primary} />
                    <Text variant="small" color={Colors.textSecondary} style={{ flex: 1 }}>
                      {g.suggestion}
                    </Text>
                  </View>
                  <Button
                    variant="secondary"
                    icon="paper-plane"
                    title={t('classDetail.assignPractice', { topic: g.topic })}
                    onPress={() => assign(g.topic)}
                  />
                </Card>
              ))}
            </View>
          )}
          <Text variant="heading">{t('classDetail.masteryByTopic')}</Text>
          <Card style={{ gap: Spacing.md }}>
            {c.topicMastery.map((m) => (
              <View key={m.topic} style={{ gap: 6 }}>
                <View style={styles.rowBetween}>
                  <Text variant="small">{m.topic}</Text>
                  <Text variant="small" color={masteryColor(m.mastery)}>
                    {pct(m.mastery)}
                  </Text>
                </View>
                <ProgressBar
                  progress={m.mastery}
                  height={8}
                  colors={m.mastery >= 0.6 ? Gradients.mastery : Gradients.streak}
                />
              </View>
            ))}
          </Card>
        </View>
      )}

      {tab === 'students' &&
        [...c.students]
          .sort((a, b) => a.mastery - b.mastery)
          .map((s) => (
            <Card key={s.id} style={{ gap: Spacing.sm }}>
              <View style={styles.student}>
                <View style={[styles.avatar, { backgroundColor: masteryColor(s.mastery) + '33' }]}>
                  <Text variant="bodyStrong" color={masteryColor(s.mastery)}>
                    {s.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text variant="bodyStrong">{s.name}</Text>
                  <Text variant="small" color={Colors.textSecondary}>
                    {t('classDetail.studentMeta', {
                      active: daysAgo(s.lastActive, t),
                      count: s.completed,
                      streak: formatNumber(s.streak),
                    })}
                  </Text>
                </View>
                <Text variant="heading" color={masteryColor(s.mastery)}>
                  {pct(s.mastery)}
                </Text>
              </View>
              {s.weakTopics.length > 0 && (
                <View style={styles.weakRow}>
                  {s.weakTopics.map((topic) => (
                    <View key={topic} style={styles.weak}>
                      <Text variant="small" color={Colors.textSecondary} style={{ fontSize: 12 }}>
                        {t('classDetail.needsHelp', { topic })}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </Card>
          ))}

      {tab === 'assignments' && (
        <View style={{ gap: Spacing.sm }}>
          <Button title={t('classDetail.newAssignment')} icon="add" onPress={() => assign()} />
          {c.assignments.map((a) => (
            <Pressable key={a.id} onPress={() => router.push(`/assignment/${a.id}`)} accessibilityRole="button">
              <Card style={{ gap: Spacing.sm }}>
                <View style={styles.rowBetween}>
                  <Text variant="bodyStrong" style={{ flex: 1 }} numberOfLines={1}>
                    {a.title}
                  </Text>
                  <Text variant="small" color={isPast(a.dueAt) ? Colors.textMuted : Colors.reward}>
                    {relativeDue(a.dueAt)}
                  </Text>
                </View>
                <ProgressBar progress={a.total ? a.submitted / a.total : 0} height={6} />
                <Text variant="small" color={Colors.textSecondary}>
                  {a.avgScore !== null
                    ? t('classDetail.submittedWithAverage', {
                        submitted: formatNumber(a.submitted),
                        total: formatNumber(a.total),
                        average: pct(a.avgScore),
                      })
                    : t('classDetail.submitted', {
                        submitted: formatNumber(a.submitted),
                        total: formatNumber(a.total),
                      })}
                </Text>
              </Card>
            </Pressable>
          ))}
        </View>
      )}
    </Screen>
  );
}

function HeroStat({ value, label }: { value: string; label: string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Text variant="title">{value}</Text>
      <Text variant="small" color="rgba(255,255,255,0.85)">
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { borderRadius: Radius.lg, padding: Spacing.md, gap: Spacing.md },
  heroStats: { flexDirection: 'row' },
  code: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    backgroundColor: 'rgba(0,0,0,0.22)',
    borderRadius: Radius.md,
    paddingVertical: Spacing.xs,
  },
  segment: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  segmentItem: { flex: 1, alignItems: 'center', paddingVertical: Spacing.xs, borderRadius: Radius.sm },
  segmentActive: { backgroundColor: Colors.primary },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: Spacing.sm },
  pill: { backgroundColor: Colors.dangerSoft, paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.pill },
  tip: { flexDirection: 'row', gap: Spacing.xs, alignItems: 'flex-start' },
  student: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  avatar: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  weakRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  weak: { backgroundColor: Colors.surfaceRaised, paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radius.pill },
});
