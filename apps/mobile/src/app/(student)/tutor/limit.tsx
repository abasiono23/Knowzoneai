import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from '@/components/ui/gradient';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { AuthScreen } from '@/components/auth/auth-screen';
import { HeroIcon } from '@/components/auth/hero-icon';
import { Button, Card, ProgressBar, Text } from '@/components/ui';
import { Colors, Gradients, Radius, Spacing } from '@/constants/theme';
import { PLANS } from '@/lib/billing/plans';
import { useSession } from '@/lib/session';
import { useTutor } from '@/lib/tutor/store';
import { DAILY_LIMITS } from '@/lib/tutor/types';


/** Screen 60: today's tutor allowance, when it resets, and ways to get more. */
export default function UsageLimitScreen() {
  const { t } = useTranslation('tutor');
  const { remaining, limit, resetAt } = useTutor();
  const { user } = useSession();
  // Minutes until the allowance starts again.
  const untilReset = () => Math.max(0, Math.round((resetAt - Date.now()) / 60_000));
  const [mins, setMins] = useState(untilReset);
  const out = remaining <= 0;
  const reset = t('limit.resetIn', { hours: Math.floor(mins / 60), minutes: mins % 60 });

  useEffect(() => {
    const timer = setInterval(() => setMins(untilReset()), 30_000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-run only when the reset time changes
  }, [resetAt]);

  return (
    <AuthScreen
      hero={<HeroIcon icon={out ? 'hourglass' : 'flash'} colors={out ? Gradients.reward : Gradients.ai} />}
      title={out ? t('limit.outTitle') : t('limit.title')}
      subtitle={out ? t('limit.outSubtitle', { limit, reset }) : t('limit.subtitle', { remaining, limit, reset })}
      footer={
        <>
          <Button
            title={t('limit.getPlus')}
            icon="rocket"
            onPress={() => router.push({ pathname: '/billing/upgrade', params: { reason: 'tutor' } })}
          />
          <Button
            variant="ghost"
            title={out ? t('limit.keepStudying') : t('actions.back', { ns: 'common' })}
            onPress={() => router.back()}
          />
        </>
      }>
      <Card style={{ gap: Spacing.xs }}>
        <View style={styles.rowBetween}>
          <Text variant="small" color={Colors.textSecondary}>
            {t('limit.usedToday')}
          </Text>
          <Text variant="bodyStrong">{t('limit.used', { used: limit - remaining, limit })}</Text>
        </View>
        <ProgressBar
          progress={(limit - remaining) / limit}
          height={10}
          colors={out ? Gradients.reward : Gradients.ai}
        />
      </Card>

      <LinearGradient colors={Gradients.ai} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.plus}>
        <Text variant="label" color="rgba(255,255,255,0.85)">
          {t('limit.plusEyebrow')}
        </Text>
        <Text variant="title">{t('limit.plusQuestions', { count: DAILY_LIMITS.PLUS })}</Text>
        {PLANS.PLUS.features.slice(1, 5).map(({ text: f }) => (
          <View key={f} style={styles.feature}>
            <Ionicons name="checkmark-circle" size={18} color={Colors.textOnAccent} />
            <Text variant="small">{f}</Text>
          </View>
        ))}
      </LinearGradient>

      <Text variant="heading">{t('limit.orFree')}</Text>
      {[
        {
          id: 'invite',
          icon: 'gift',
          title: t('limit.invite'),
          body: t('limit.inviteBody'),
          onPress: () => router.push('/referrals/invite'),
        },
        {
          id: 'flashcards',
          icon: 'albums',
          title: t('limit.flashcards'),
          body: t('limit.flashcardsBody'),
          onPress: () => router.push('/saved'),
        },
        {
          id: 'notes',
          icon: 'bookmark',
          title: t('limit.notes'),
          body: t('limit.notesBody'),
          onPress: () => router.push('/tutor/notes'),
        },
      ].map((o) => (
        <Card key={o.id} style={styles.option}>
          <Ionicons name={o.icon as keyof typeof Ionicons.glyphMap} size={22} color={Colors.reward} />
          <View style={{ flex: 1 }}>
            <Text variant="bodyStrong">{o.title}</Text>
            <Text variant="small" color={Colors.textSecondary}>
              {o.body}
            </Text>
          </View>
          <Button variant="ghost" title={t('limit.go')} onPress={o.onPress} />
        </Card>
      ))}
      <Text variant="small" color={Colors.textMuted} center>
        {t('limit.footer', { plan: user?.plan === 'FREE' ? t('limit.planFree') : user?.plan })}
      </Text>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  plus: { borderRadius: Radius.lg, padding: Spacing.md, gap: Spacing.xs },
  feature: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  option: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.xs },
});
