import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from '@/components/ui/gradient';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AuthScreen } from '@/components/auth/auth-screen';
import { Celebration } from '@/components/onboarding/celebration';
import { SuccessBadge } from '@/components/onboarding/success-badge';
import { Button, Card, Text } from '@/components/ui';
import { Colors, Gradients, Radius, Spacing } from '@/constants/theme';
import { errorText } from '@/i18n/errors';
import { api } from '@/lib/api';
import { buildPlan } from '@/lib/learning-plan';
import { requestReminderPermission, syncReminders } from '@/lib/reminders';
import { usePersonalization } from '@/lib/personalization-store';
import { useSession } from '@/lib/session';

export default function StartLearningScreen() {
  const { profile, reset } = usePersonalization();
  const { user, setUser } = useSession();
  const { t } = useTranslation('personalize');
  const plan = useMemo(() => buildPlan(profile, t), [profile, t]);
  const [busy, setBusy] = useState<'lesson' | 'home' | null>(null);
  const teacher = profile.learnerType === 'teacher';
  const [error, setError] = useState<string | null>(null);

  const start = async (destination: 'lesson' | 'home') => {
    setBusy(destination);
    setError(null);
    try {
      await api.savePersonalization(profile);
      const res = await api.completeOnboarding();
      // Reminders chosen during onboarding (screen 29): ask for permission now, then schedule them.
      if (profile.reminders.enabled && (await requestReminderPermission()))
        await api
          .getSettings()
          .then(({ settings }) => syncReminders(settings))
          .catch(() => {});
      reset();
      // Flipping onboardingComplete moves the root guard into the app (Home).
      setUser(res.user);
      if (destination === 'lesson') setTimeout(() => router.navigate(teacher ? '/assignment/new' : '/studio'), 50);
    } catch (e) {
      setError(errorText(e));
      setBusy(null);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <AuthScreen
        center
        back={false}
        backdrop="reward"
        footer={
          <>
            {error && (
              <Text variant="small" color={Colors.danger} center>
                {error}
              </Text>
            )}
            <Button
              title={teacher ? t('start.firstAssignment') : t('start.startLesson')}
              icon={teacher ? 'paper-plane' : 'play'}
              onPress={() => start('lesson')}
              loading={busy === 'lesson'}
              disabled={!!busy}
            />
            <Button
              variant="ghost"
              title={t('start.dashboard')}
              onPress={() => start('home')}
              loading={busy === 'home'}
              disabled={!!busy}
            />
          </>
        }>
        <SuccessBadge icon={teacher ? 'easel' : 'rocket'} colors={Gradients.ai} size={104} />
        <Animated.View entering={FadeInDown.delay(250).duration(500)} style={{ gap: Spacing.xs }}>
          <Text variant="display" center>
            {teacher
              ? user?.name
                ? t('start.readyTeacherNamed', { name: user.name })
                : t('start.readyTeacher')
              : user?.name
                ? t('start.readyNamed', { name: user.name })
                : t('start.ready')}
          </Text>
          <Text color={Colors.textSecondary} center>
            {teacher ? t('start.bodyTeacher') : t('start.body', { count: profile.dailyMinutes })}
          </Text>
        </Animated.View>

        {!teacher && (
          <>
            <Animated.View entering={FadeInDown.delay(450).duration(500)}>
              <LinearGradient
                colors={Gradients.mastery}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.lesson}>
                <View style={styles.play}>
                  <Ionicons name="play" size={22} color={Colors.success} style={{ marginLeft: 3 }} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text variant="label" color="rgba(255,255,255,0.85)">
                    {t('start.firstLesson', { minutes: plan.firstLesson.minutes })}
                  </Text>
                  <Text variant="bodyStrong">{plan.firstLesson.title}</Text>
                </View>
              </LinearGradient>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(600).duration(500)}>
              <Card style={styles.rewardRow}>
                <Reward icon="flash" color={Colors.reward} label={t('start.xp', { count: 50 })} />
                <Reward icon="flame" color={Colors.danger} label={t('start.streak')} />
                <Reward icon="planet" color={Colors.primary} label={plan.startingWorld.name} />
              </Card>
            </Animated.View>
          </>
        )}
      </AuthScreen>
      <Celebration />
    </View>
  );
}

function Reward({ icon, color, label }: { icon: keyof typeof Ionicons.glyphMap; color: string; label: string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', gap: 4 }}>
      <Ionicons name={icon} size={20} color={color} />
      <Text variant="small" center style={{ fontSize: 12, lineHeight: 16 }}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  lesson: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.md, borderRadius: Radius.lg },
  play: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rewardRow: { flexDirection: 'row', paddingVertical: Spacing.sm },
});
