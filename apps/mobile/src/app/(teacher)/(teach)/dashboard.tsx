import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ClassCard } from '@/components/teacher/class-card';
import { Card, Screen, SectionHeader, Text } from '@/components/ui';
import { Colors, Gradients, Palette, Radius, Spacing } from '@/constants/theme';
import { formatNumber } from '@/i18n';
import { useFlipStyle } from '@/i18n/provider';
import { useSession } from '@/lib/session';
import { relativeDue, teacherApi, type TeacherOverview } from '@/lib/teacher';

const ACTIONS: {
  icon: keyof typeof Ionicons.glyphMap;
  id: 'newAssignment' | 'createClass' | 'materials';
  color: string;
  href: '/assignment/new' | '/class/new' | '/materials';
}[] = [
  { icon: 'paper-plane', id: 'newAssignment', color: Palette.purple400, href: '/assignment/new' },
  { icon: 'add-circle', id: 'createClass', color: Palette.teal400, href: '/class/new' },
  { icon: 'sparkles', id: 'materials', color: Palette.gold400, href: '/materials' },
];

export default function TeacherDashboard() {
  const { t } = useTranslation('teacher');
  const flip = useFlipStyle();
  const { user } = useSession();
  const [data, setData] = useState<TeacherOverview | null>(null);

  useFocusEffect(
    useCallback(() => {
      teacherApi
        .overview()
        .then(setData)
        .catch(() => {});
    }, []),
  );

  return (
    <Screen>
      <View>
        <Text variant="small" color={Colors.textSecondary}>
          {t('dashboard.welcome')}
        </Text>
        <Text variant="display">{user?.name ?? t('dashboard.fallbackName')}</Text>
      </View>

      {!data ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: Spacing.xl }} />
      ) : (
        <>
          <View style={styles.stats}>
            <Stat
              icon="people"
              color={Palette.sky400}
              value={formatNumber(data.totals.students)}
              label={t('dashboard.stats.students')}
            />
            <Stat
              icon="document-text"
              color={Palette.purple400}
              value={formatNumber(data.totals.activeAssignments)}
              label={t('dashboard.stats.activeTasks')}
            />
            <Stat
              icon="trending-up"
              color={Palette.teal400}
              value={formatNumber(data.totals.avgMastery, { style: 'percent', maximumFractionDigits: 0 })}
              label={t('dashboard.stats.avgMastery')}
            />
            <Stat
              icon="checkmark-done"
              color={Palette.gold400}
              value={formatNumber(data.totals.submissionsThisWeek)}
              label={t('dashboard.stats.submissions')}
            />
          </View>

          <View style={styles.actions}>
            {ACTIONS.map((a) => (
              <Pressable
                key={a.id}
                onPress={() => router.push(a.href)}
                accessibilityRole="button"
                style={({ pressed }) => [styles.action, { transform: [{ scale: pressed ? 0.96 : 1 }] }]}>
                <View style={[styles.actionIcon, { backgroundColor: a.color + '22' }]}>
                  <Ionicons name={a.icon} size={22} color={a.color} />
                </View>
                <Text variant="small" center style={{ fontFamily: 'Manrope_600SemiBold' }}>
                  {t(`dashboard.actions.${a.id}`)}
                </Text>
              </Pressable>
            ))}
          </View>

          {data.needsAttention.length > 0 && (
            <View style={{ gap: Spacing.sm }}>
              <SectionHeader title={t('dashboard.needsAttention')} />
              {data.needsAttention.map((n) => (
                <Pressable
                  key={n.classId + n.topic}
                  onPress={() => router.push(`/class/${n.classId}`)}
                  accessibilityRole="button">
                  <LinearGradient
                    colors={Gradients.streak}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.alert}>
                    <Ionicons name="alert-circle" size={26} color={Colors.textOnAccent} />
                    <View style={{ flex: 1 }}>
                      <Text variant="bodyStrong">
                        {t('dashboard.struggling', { count: n.studentsStruggling, topic: n.topic })}
                      </Text>
                      <Text variant="small" color="rgba(255,255,255,0.9)">
                        {t('dashboard.strugglingHint', { className: n.className })}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={Colors.textOnAccent} style={flip} />
                  </LinearGradient>
                </Pressable>
              ))}
            </View>
          )}

          <View style={{ gap: Spacing.sm }}>
            <SectionHeader
              title={t('dashboard.yourClasses')}
              action={t('actions.seeAll', { ns: 'common' })}
              onAction={() => router.navigate('/classes')}
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: Spacing.sm }}>
              {data.classes.map((c) => (
                <ClassCard key={c.id} c={c} compact />
              ))}
            </ScrollView>
          </View>

          <View style={{ gap: Spacing.sm }}>
            <SectionHeader title={t('dashboard.upcoming')} />
            {data.upcoming.length === 0 ? (
              <Card>
                <Text color={Colors.textSecondary}>{t('dashboard.noUpcoming')}</Text>
              </Card>
            ) : (
              data.upcoming.map((a) => (
                <Pressable key={a.id} onPress={() => router.push(`/assignment/${a.id}`)} accessibilityRole="button">
                  <Card style={styles.deadline}>
                    <View style={styles.deadlineIcon}>
                      <Ionicons name="calendar" size={20} color={Colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text variant="bodyStrong" numberOfLines={1}>
                        {a.title}
                      </Text>
                      <Text variant="small" color={Colors.textSecondary}>
                        {t('dashboard.deadlineMeta', { className: a.className, due: relativeDue(a.dueAt) })}
                      </Text>
                    </View>
                    <Text variant="small" color={Colors.success}>
                      {t('dashboard.submittedCount', {
                        submitted: formatNumber(a.submitted),
                        total: formatNumber(a.total),
                      })}
                    </Text>
                  </Card>
                </Pressable>
              ))
            )}
          </View>
        </>
      )}
      <Pressable
        onPress={() => router.push('/courses')}
        accessibilityRole="button"
        accessibilityLabel={t('dashboard.coursesA11y')}>
        <Card style={styles.courses}>
          <Ionicons name="library" size={22} color={Colors.primary} />
          <View style={{ flex: 1 }}>
            <Text variant="bodyStrong">{t('dashboard.coursesTitle')}</Text>
            <Text variant="small" color={Colors.textSecondary}>
              {t('dashboard.coursesBody')}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} style={flip} />
        </Card>
      </Pressable>
    </Screen>
  );
}

function Stat({
  icon,
  color,
  value,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  value: number | string;
  label: string;
}) {
  return (
    <Card style={styles.stat}>
      <Ionicons name={icon} size={18} color={color} />
      <Text variant="title">{value}</Text>
      <Text variant="small" color={Colors.textSecondary}>
        {label}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  courses: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  stat: { width: '47%', flexGrow: 1, gap: 2 },
  actions: { flexDirection: 'row', gap: Spacing.sm },
  action: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  alert: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.md, borderRadius: Radius.lg },
  deadline: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  deadlineIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.sm,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
