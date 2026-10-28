import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from '@/components/ui/gradient';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { AuthScreen } from '@/components/auth/auth-screen';
import { LogoMark } from '@/components/brand/logo';
import { SoftGlow } from '@/components/brand/soft-glow';
import { Button, Card, Text } from '@/components/ui';
import { Colors, Gradients, Palette, Radius, Spacing } from '@/constants/theme';
import { formatNumber } from '@/i18n';
import { buildPlan } from '@/lib/learning-plan';
import { TeacherPlan } from '@/components/personalize/teacher-plan';
import { usePersonalization } from '@/lib/personalization-store';

const BUILD_STEPS = ['goals', 'subjects', 'week', 'lesson'] as const;
const TEACHER_BUILD_STEPS = ['priorities', 'class', 'toolkit', 'week'] as const;

export default function PlanScreen() {
  const { profile } = usePersonalization();
  const { t } = useTranslation('personalize');
  const plan = useMemo(() => buildPlan(profile, t), [profile, t]);
  const [built, setBuilt] = useState(0);
  const teacher = profile.learnerType === 'teacher';
  const steps = teacher
    ? TEACHER_BUILD_STEPS.map((s) => t(`plan.teacherBuildSteps.${s}`))
    : BUILD_STEPS.map((s) => t(`plan.buildSteps.${s}`));

  // Short "building" reveal so the plan feels considered, not instant boilerplate.
  useEffect(() => {
    if (built >= steps.length) return;
    const timer = setTimeout(() => setBuilt((b) => b + 1), 650);
    return () => clearTimeout(timer);
  }, [built, steps.length]);

  if (built < steps.length) {
    return (
      <AuthScreen center back={false} backdrop="hero">
        <View style={styles.builder}>
          <SoftGlow color={Palette.purple500} size={300} />
          <LogoMark size={88} />
        </View>
        <Text variant="title" center>
          {teacher ? t('plan.buildingTeacher') : t('plan.building')}
        </Text>
        <Card style={{ gap: Spacing.sm }}>
          {steps.map((s, i) => (
            <View key={s} style={styles.buildRow}>
              {i < built ? (
                <Animated.View entering={FadeIn}>
                  <Ionicons name="checkmark-circle" size={22} color={Colors.success} />
                </Animated.View>
              ) : i === built ? (
                <ActivityIndicator size="small" color={Colors.primary} style={{ width: 22 }} />
              ) : (
                <Ionicons name="ellipse-outline" size={22} color={Colors.textMuted} />
              )}
              <Text color={i <= built ? Colors.text : Colors.textMuted}>{s}</Text>
            </View>
          ))}
        </Card>
      </AuthScreen>
    );
  }

  if (teacher) return <TeacherPlan profile={profile} />;

  return (
    <AuthScreen
      back={false}
      backdrop="hero"
      hero={
        <Text variant="label" color={Colors.success}>
          {t('plan.eyebrow')}
        </Text>
      }
      title={plan.headline}
      footer={
        <>
          <Button title={t('plan.letsGo')} icon="rocket" onPress={() => router.push('/personalize/start')} />
          <Button variant="ghost" title={t('plan.adjust')} onPress={() => router.back()} />
        </>
      }>
      <Animated.View entering={FadeInDown.duration(400)}>
        <LinearGradient colors={Gradients.ai} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.summary}>
          <Summary value={formatNumber(plan.weeklyMinutes)} label={t('plan.minPerWeek')} />
          <View style={styles.vr} />
          <Summary
            value={formatNumber(plan.exam ? plan.exam.weeksLeft : 6)}
            label={plan.exam ? t('plan.weeksToExam', { count: plan.exam.weeksLeft }) : t('plan.studyDays')}
          />
          <View style={styles.vr} />
          <Summary value={plan.startingWorld.emoji} label={plan.startingWorld.name} />
        </LinearGradient>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(120).duration(400)} style={{ gap: Spacing.sm }}>
        <Text variant="heading">{t('plan.yourWeek')}</Text>
        <Card style={{ padding: 0 }}>
          {plan.days.map((d, i) => (
            <View key={d.day} style={[styles.dayRow, i > 0 && styles.divider]}>
              <View style={[styles.dayBadge, d.rest && { backgroundColor: Colors.successSoft }]}>
                <Text variant="label" color={d.rest ? Colors.success : Colors.primary}>
                  {d.day.toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="bodyStrong" numberOfLines={1}>
                  {d.focus}
                </Text>
                <Text variant="small" color={Colors.textSecondary} numberOfLines={1}>
                  {d.activity}
                </Text>
              </View>
              <Text variant="small" color={Colors.textMuted}>
                {t('plan.minutesShort', { count: d.minutes })}
              </Text>
            </View>
          ))}
        </Card>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(240).duration(400)} style={{ gap: Spacing.sm }}>
        <Text variant="heading">{t('plan.milestonesTitle')}</Text>
        {plan.milestones.map((m) => (
          <View key={m.week} style={styles.milestone}>
            <View style={styles.weekDot}>
              <Text variant="label" color={Colors.onBright}>
                {t('plan.weekShort', { week: m.week })}
              </Text>
            </View>
            <Text style={{ flex: 1 }}>{m.title}</Text>
          </View>
        ))}
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(360).duration(400)}>
        <Card style={{ gap: 6 }}>
          <Text variant="label" color={Colors.textMuted}>
            {t('plan.formatsTitle')}
          </Text>
          <Text>{plan.formats.join(' · ')}</Text>
        </Card>
      </Animated.View>
    </AuthScreen>
  );
}

function Summary({ value, label }: { value: string; label: string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', gap: 2 }}>
      <Text variant="title">{value}</Text>
      <Text variant="small" color="rgba(255,255,255,0.85)" center style={{ fontSize: 12, lineHeight: 16 }}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  builder: { alignItems: 'center', justifyContent: 'center', height: 160 },
  buildRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  summary: { flexDirection: 'row', alignItems: 'center', borderRadius: Radius.lg, paddingVertical: Spacing.md },
  vr: { width: 1, height: 36, backgroundColor: 'rgba(255,255,255,0.25)' },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  divider: { borderTopWidth: 1, borderTopColor: Colors.border },
  dayBadge: {
    width: 48,
    paddingVertical: 6,
    borderRadius: Radius.sm,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
  },
  milestone: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  weekDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.reward,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
