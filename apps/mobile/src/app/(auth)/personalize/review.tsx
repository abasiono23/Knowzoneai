import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { StepScreen } from '@/components/personalize/step-screen';
import { Card, Text } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { errorText } from '@/i18n/errors';
import { api } from '@/lib/api';
import {
  AGE_GROUPS,
  EDUCATION_LEVELS,
  EXAMS,
  FORMATS,
  GOALS,
  INTERESTS,
  LANGUAGES,
  LEARNER_TYPES,
  labelOf,
  learnerKey,
  NO_EXAM,
  PATHWAYS,
  stepsFor,
  subjectLabel,
  TEACH_LEVELS,
  TEACHER_GOALS,
  TEACHER_ROLES,
  upcomingMonths,
  type Step,
} from '@/lib/personalization';
import { usePersonalization } from '@/lib/personalization-store';
import { useSession } from '@/lib/session';

export default function ReviewScreen() {
  const { profile: p } = usePersonalization();
  const { setUser } = useSession();
  const { t } = useTranslation('personalize');
  const [error, setError] = useState<string | null>(null);
  const type = learnerKey(p.learnerType);

  const labels = (ids: string[], options: { id: string; label: string }[]) =>
    ids.map((id) => options.find((o) => o.id === id)?.label ?? id).join(', ') || t('notSet');

  const exam = p.examGoals.includes(NO_EXAM)
    ? t('noExam')
    : labels(p.examGoals, EXAMS[type]) +
      (p.examMonth ? ` · ${upcomingMonths().find((m) => m.id === p.examMonth)?.label ?? ''}` : '');

  const teacher = p.learnerType === 'teacher';
  const allRows: { step: Step; icon: keyof typeof Ionicons.glyphMap; label: string; value: string }[] = [
    {
      step: 'learner-type',
      icon: 'person',
      label: t('review.rows.learnerType'),
      value: labelOf(LEARNER_TYPES, p.learnerType),
    },
    {
      step: 'teacher-role',
      icon: 'easel',
      label: t('review.rows.teacherRole'),
      value: labelOf(TEACHER_ROLES, p.teacherRole),
    },
    {
      step: 'teach-levels',
      icon: 'people',
      label: t('review.rows.teachLevels'),
      value: labels(p.teachLevels, TEACH_LEVELS),
    },
    { step: 'age', icon: 'calendar', label: t('review.rows.age'), value: labelOf(AGE_GROUPS, p.ageGroup) },
    {
      step: 'education',
      icon: 'school',
      label: t('review.rows.education'),
      value: labelOf(EDUCATION_LEVELS[type], p.educationLevel),
    },
    {
      step: 'pathway',
      icon: 'git-branch',
      label: t('review.rows.pathway'),
      value: [labelOf(PATHWAYS[type].tracks, p.track), p.institution].filter(Boolean).join(' · '),
    },
    { step: 'exams', icon: 'ribbon', label: t('review.rows.exams'), value: exam },
    {
      step: 'subjects',
      icon: 'book',
      label: t('review.rows.subjects'),
      value: p.subjects.map(subjectLabel).join(', ') || t('notSet'),
    },
    {
      step: 'teacher-goals',
      icon: 'flag',
      label: t('review.rows.teacherGoals'),
      value: labels(p.teacherGoals, TEACHER_GOALS),
    },
    {
      step: 'first-class',
      icon: 'school',
      label: t('review.rows.firstClass'),
      value: p.firstClass?.name
        ? `${p.firstClass.name} · ${subjectLabel(p.firstClass.subject)}`
        : t('review.setUpLater'),
    },
    { step: 'interests', icon: 'heart', label: t('review.rows.interests'), value: labels(p.interests, INTERESTS) },
    { step: 'goals', icon: 'flag', label: t('review.rows.goals'), value: labels(p.goals, GOALS) },
    { step: 'formats', icon: 'play-circle', label: t('review.rows.formats'), value: labels(p.formats, FORMATS) },
    {
      step: 'language',
      icon: 'language',
      label: t('review.rows.language'),
      value: LANGUAGES.find((l) => l.id === p.language)?.native ?? 'English',
    },
    {
      step: 'daily-target',
      icon: 'timer',
      label: t('review.rows.dailyTarget'),
      value: t('review.dailyMinutes', { count: p.dailyMinutes }),
    },
    {
      step: 'reminders',
      icon: 'notifications',
      label: t('review.rows.reminders'),
      value: p.reminders.enabled
        ? t('review.reminderDays', { time: p.reminders.time, count: p.reminders.days.length })
        : t('review.off'),
    },
  ];
  // Only show the questions this user actually answered on their branch.
  const rows = allRows.filter((r) => stepsFor(p.learnerType).includes(r.step));

  const save = async () => {
    setError(null);
    try {
      const res = await api.savePersonalization(p);
      setUser(res.user);
    } catch (e) {
      // The plan still builds from the local draft; saving retries when onboarding completes.
      setError(errorText(e));
    }
  };

  return (
    <StepScreen
      step="review"
      title={t('review.title')}
      subtitle={teacher ? t('review.subtitleTeacher') : t('review.subtitle')}
      continueLabel={teacher ? t('review.continueTeacher') : t('review.continue')}
      onContinue={save}>
      <Card style={{ padding: 0 }}>
        {rows.map((r, i) => (
          <Pressable
            key={r.step}
            onPress={() => router.push(`/personalize/${r.step}?edit=1` as Href)}
            accessibilityRole="button"
            accessibilityLabel={t('review.rowA11y', { label: r.label, value: r.value })}
            style={({ pressed }) => [
              styles.row,
              i > 0 && styles.divider,
              pressed && { backgroundColor: Colors.surfaceRaised },
            ]}>
            <View style={styles.icon}>
              <Ionicons name={r.icon} size={16} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="label" color={Colors.textMuted}>
                {r.label.toUpperCase()}
              </Text>
              <Text variant="small" numberOfLines={2}>
                {r.value}
              </Text>
            </View>
            <Ionicons name="create-outline" size={18} color={Colors.textMuted} />
          </Pressable>
        ))}
      </Card>
      {error && (
        <Text variant="small" color={Colors.danger} center>
          {error}
        </Text>
      )}
    </StepScreen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  divider: { borderTopWidth: 1, borderTopColor: Colors.border },
  icon: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
