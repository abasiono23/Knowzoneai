import { Ionicons } from '@expo/vector-icons';
import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Card, Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { formatDate } from '@/i18n';
import type { CreditEntry } from '@/lib/api';
import { useReferrals } from '@/lib/referrals/use-referrals';
import { useSession } from '@/lib/session';

const META: Record<
  CreditEntry['reason'],
  {
    label: (e: CreditEntry, t: TFunction<'referrals'>) => string;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
  }
> = {
  welcome: { label: (_e, t) => t('history.welcome'), icon: 'sparkles', color: Colors.primary },
  'referral-inviter': {
    label: (e, t) => (e.friendName ? t('history.inviter', { name: e.friendName }) : t('history.inviterUnknown')),
    icon: 'person-add',
    color: Colors.success,
  },
  'referral-invitee': {
    label: (e, t) => (e.friendName ? t('history.invitee', { name: e.friendName }) : t('history.inviteeUnknown')),
    icon: 'gift',
    color: Colors.reward,
  },
  plan: { label: (_e, t) => t('history.plan'), icon: 'rocket', color: Colors.primary },
  spend: {
    label: (e, t) => (e.friendName ? t('history.used', { name: e.friendName }) : t('history.usedAi')),
    icon: 'sparkles',
    color: Colors.textSecondary,
  },
};

/** Screen 173: every AI-credit reward from invites (and the welcome credits). */
export default function ReferralRewardHistoryScreen() {
  const { user } = useSession();
  const { data } = useReferrals();
  const { t } = useTranslation('referrals');
  const entries = data?.credits ?? [];
  const fromReferrals = entries
    .filter((e) => e.reason === 'referral-inviter' || e.reason === 'referral-invitee')
    .reduce((n, e) => n + e.credits, 0);

  return (
    <Screen withTabBar={false}>
      <ScreenHeader eyebrow={t('eyebrow')} title={t('history.title')} />
      <View style={styles.stats}>
        <Card style={styles.stat}>
          <Ionicons name="flash" size={20} color={Colors.primary} />
          <Text variant="title">{user?.aiCredits ?? 0}</Text>
          <Text variant="small" color={Colors.textMuted} style={{ fontSize: 12 }}>
            {t('history.creditsNow')}
          </Text>
        </Card>
        <Card style={styles.stat}>
          <Ionicons name="people" size={20} color={Colors.success} />
          <Text variant="title">+{fromReferrals}</Text>
          <Text variant="small" color={Colors.textMuted} style={{ fontSize: 12 }}>
            {t('history.fromInvites')}
          </Text>
        </Card>
      </View>
      {!data ? (
        <Text variant="small" color={Colors.textMuted} center>
          {t('status.loading', { ns: 'common' })}
        </Text>
      ) : (
        <Card style={{ gap: Spacing.md }}>
          {entries.map((e) => {
            const m = META[e.reason];
            const label = m.label(e, t);
            return (
              <View
                key={e.id}
                style={styles.row}
                accessible
                accessibilityLabel={
                  e.credits > 0
                    ? t('history.plusA11y', { label, count: Math.abs(e.credits) })
                    : t('history.minusA11y', { label, count: Math.abs(e.credits) })
                }>
                <View style={[styles.icon, { backgroundColor: m.color + '22' }]}>
                  <Ionicons name={m.icon} size={18} color={m.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text variant="small" style={{ fontFamily: 'Manrope_600SemiBold' }}>
                    {label}
                  </Text>
                  <Text variant="small" color={Colors.textMuted} style={{ fontSize: 11 }}>
                    {formatDate(e.at, { day: 'numeric', month: 'short', year: 'numeric' })}
                  </Text>
                </View>
                <Text variant="bodyStrong" color={e.credits < 0 ? Colors.textSecondary : Colors.success}>
                  {e.credits < 0 ? `−${Math.abs(e.credits)}` : `+${e.credits}`}
                </Text>
              </View>
            );
          })}
        </Card>
      )}
      <Text variant="small" color={Colors.textMuted} center>
        {t('history.note')}
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stats: { flexDirection: 'row', gap: Spacing.sm },
  stat: { flex: 1, alignItems: 'center', gap: 2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  icon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
});
