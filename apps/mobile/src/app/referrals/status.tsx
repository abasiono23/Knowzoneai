import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { FriendAvatar, ReferralSteps, StatusBadge } from '@/components/referrals/referral-ui';
import { Button, Card, Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { useReferrals } from '@/lib/referrals/use-referrals';
import { useSession } from '@/lib/session';

/** Screen 175: eligibility and pending rewards, for your own invite and for friends you invited. */
export default function ReferralEligibilityScreen() {
  const { user } = useSession();
  const { data } = useReferrals();
  const { t } = useTranslation('referrals');
  const [now] = useState(() => Date.now());
  if (!data || !user)
    return (
      <Screen withTabBar={false}>
        <ScreenHeader eyebrow={t('eyebrow')} title={t('eligibility.title')} />
      </Screen>
    );
  const mine = data.invitedBy;
  const pending = data.referrals.filter((r) => r.status === 'pending');
  const capped = data.confirmedThisMonth >= data.monthlyCap;

  const rules = [
    { ok: true, text: t('eligibility.rules.new') },
    { ok: true, text: t('eligibility.rules.verified') },
    { ok: true, text: t('eligibility.rules.activity') },
    {
      ok: !capped,
      text: t('eligibility.rules.cap', { cap: data.monthlyCap, count: data.confirmedThisMonth }),
    },
  ];

  return (
    <Screen withTabBar={false}>
      <ScreenHeader eyebrow={t('eyebrow')} title={t('eligibility.fullTitle')} />

      {mine && (
        <Card style={[{ gap: Spacing.sm }, mine.status === 'pending' && { borderColor: Colors.reward + '88' }]}>
          <Text variant="label" color={Colors.reward}>
            {t('eligibility.yourInvite')}
          </Text>
          <View style={styles.head}>
            <FriendAvatar name={mine.inviterName} />
            <View style={{ flex: 1, gap: 4 }}>
              <Text variant="bodyStrong">{t('eligibility.invitedBy', { name: mine.inviterName })}</Text>
              <StatusBadge status={mine.status} />
            </View>
          </View>
          <ReferralSteps
            joinedAt={mine.appliedAt}
            emailVerified={mine.emailVerified}
            qualifiedAt={mine.qualifiedAt}
            status={mine.status}
            credits={data.rewardCredits}
          />
          {mine.status === 'pending' && (
            <>
              <Text variant="small" color={Colors.textSecondary}>
                {mine.emailVerified
                  ? t('eligibility.oneStep', { name: mine.inviterName, credits: data.rewardCredits })
                  : t('eligibility.verifyFirst')}
              </Text>
              <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
                <Button
                  title={t('eligibility.play')}
                  icon="planet"
                  style={{ flex: 1 }}
                  onPress={() => router.push('/play')}
                />
                <Button
                  variant="secondary"
                  title={t('eligibility.courses')}
                  icon="school"
                  style={{ flex: 1 }}
                  onPress={() => router.push('/courses')}
                />
              </View>
            </>
          )}
          {mine.status === 'confirmed' && (
            <Text variant="small" color={Colors.success}>
              {t('eligibility.done')}
            </Text>
          )}
        </Card>
      )}

      <Card style={{ gap: Spacing.sm }}>
        <Text variant="heading">{t('eligibility.howQualify')}</Text>
        {rules.map((r) => (
          <View key={r.text} style={styles.rule}>
            <Ionicons
              name={r.ok ? 'checkmark-circle' : 'alert-circle'}
              size={18}
              color={r.ok ? Colors.success : Colors.reward}
            />
            <Text variant="small" style={{ flex: 1 }}>
              {r.text}
            </Text>
          </View>
        ))}
        {capped && (
          <Text variant="small" color={Colors.reward}>
            {t('eligibility.capped')}
          </Text>
        )}
      </Card>

      <Text variant="heading">{t('eligibility.pending', { count: pending.length })}</Text>
      {pending.length === 0 ? (
        <Card style={{ alignItems: 'center', gap: Spacing.xs }}>
          <Ionicons name="hourglass-outline" size={26} color={Colors.textMuted} />
          <Text variant="small" color={Colors.textSecondary} center>
            {t('eligibility.nothingPending')}
          </Text>
        </Card>
      ) : (
        pending.map((r) => (
          <Card key={r.id} style={{ gap: Spacing.sm }}>
            <View style={styles.head}>
              <FriendAvatar name={r.friendName} />
              <View style={{ flex: 1 }}>
                <Text variant="bodyStrong">{r.friendName}</Text>
                <Text variant="small" color={Colors.textMuted} style={{ fontSize: 12 }}>
                  {t('eligibility.daysLeft', { count: Math.max(0, 30 - Math.floor((now - r.joinedAt) / 86400000)) })}
                </Text>
              </View>
              <Text variant="bodyStrong" color={Colors.reward}>
                +{r.credits}
              </Text>
            </View>
            <ReferralSteps {...r} compact />
          </Card>
        ))
      )}
      <Button variant="ghost" title={t('eligibility.readTerms')} onPress={() => router.push('/referrals/terms')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  rule: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
});
