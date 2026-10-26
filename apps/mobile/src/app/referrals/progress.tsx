import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/content/empty-state';
import { ChoiceChip } from '@/components/personalize/choice-chip';
import { FriendAvatar, ReferralSteps, StatusBadge } from '@/components/referrals/referral-ui';
import { Card, Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Gradients, Radius, Spacing } from '@/constants/theme';
import type { ReferralStatus } from '@/lib/api';
import { MILESTONES } from '@/lib/referrals/messages';
import { useReferrals } from '@/lib/referrals/use-referrals';

const FILTERS: (ReferralStatus | 'all')[] = ['all', 'pending', 'confirmed', 'rejected'];

/** Screen 172: referral progress: milestones and where each friend is. */
export default function ReferralProgressScreen() {
  const { data } = useReferrals();
  const [filter, setFilter] = useState<ReferralStatus | 'all'>('all');
  const { t } = useTranslation('referrals');
  if (!data)
    return (
      <Screen withTabBar={false}>
        <ScreenHeader eyebrow={t('eyebrow')} title={t('progress.title')} />
      </Screen>
    );
  const confirmed = data.referrals.filter((r) => r.status === 'confirmed').length;
  const next = MILESTONES.find((m) => m.friends > confirmed);
  const list = data.referrals.filter((r) => filter === 'all' || r.status === filter);

  return (
    <Screen withTabBar={false}>
      <ScreenHeader eyebrow={t('eyebrow')} title={t('progress.title')} />
      <Card style={{ gap: Spacing.md }}>
        <View style={styles.between}>
          <Text variant="heading">{t('progress.milestones')}</Text>
          <Text variant="small" color={Colors.textSecondary}>
            {t('progress.rewarded', { count: confirmed })}
          </Text>
        </View>
        <View style={styles.ladder}>
          {MILESTONES.map((m, k) => {
            const got = confirmed >= m.friends;
            return (
              <View key={m.friends} style={styles.rung}>
                {k > 0 && (
                  <View style={[styles.connector, confirmed >= m.friends && { backgroundColor: Colors.reward }]} />
                )}
                <LinearGradient
                  colors={got ? Gradients.reward : [Colors.surfaceRaised, Colors.surfaceRaised]}
                  style={styles.medal}>
                  <Ionicons name={m.icon} size={20} color={got ? Colors.backgroundDeep : Colors.textMuted} />
                </LinearGradient>
                <Text variant="label" color={got ? Colors.reward : Colors.textMuted} style={{ fontSize: 10 }}>
                  {m.friends}
                </Text>
              </View>
            );
          })}
        </View>
        {next ? (
          <Text variant="small" color={Colors.textSecondary} center>
            <Trans
              t={t}
              i18nKey="progress.next"
              count={next.friends - confirmed}
              values={{
                count: next.friends - confirmed,
                title: t(`milestones.${next.id}.title`),
                reward: t(`milestones.${next.id}.reward`),
              }}
              components={{ b: <Text variant="small" style={{ fontFamily: 'Manrope_700Bold' }} /> }}
            />
          </Text>
        ) : (
          <Text variant="small" color={Colors.reward} center>
            {t('progress.allDone')}
          </Text>
        )}
      </Card>

      <View style={styles.filters}>
        {FILTERS.map((f) => (
          <ChoiceChip
            key={f}
            label={t('progress.filter', {
              label: f === 'all' ? t('progress.all') : t(`status.${f}`),
              count: f === 'all' ? data.referrals.length : data.referrals.filter((r) => r.status === f).length,
            })}
            selected={filter === f}
            onPress={() => setFilter(f)}
          />
        ))}
      </View>

      {list.length === 0 ? (
        <EmptyState
          icon="people-outline"
          title={t('progress.empty')}
          body={t('progress.emptyBody')}
          action={{ label: t('progress.invite'), onPress: () => router.push('/referrals/invite') }}
        />
      ) : (
        list.map((r) => (
          <Card key={r.id} style={{ gap: Spacing.sm }}>
            <View style={styles.head}>
              <FriendAvatar name={r.friendName} size={44} />
              <View style={{ flex: 1, gap: 4 }}>
                <Text variant="bodyStrong">{r.friendName}</Text>
                <StatusBadge status={r.status} />
              </View>
            </View>
            <ReferralSteps {...r} />
            {r.status === 'rejected' && r.rejectReason && (
              <View style={styles.reject}>
                <Ionicons name="information-circle" size={16} color={Colors.danger} />
                <Text variant="small" color={Colors.textSecondary} style={{ flex: 1 }}>
                  {r.rejectReason}
                </Text>
              </View>
            )}
            {r.status === 'pending' && (
              <Text variant="small" color={Colors.textMuted} style={{ fontSize: 12 }}>
                {t('progress.remind', { name: r.friendName.split(' ')[0] })}
              </Text>
            )}
          </Card>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ladder: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.xs,
  },
  rung: { flex: 1, alignItems: 'center', gap: 4 },
  connector: {
    position: 'absolute',
    top: 21,
    right: '50%',
    width: '100%',
    height: 3,
    backgroundColor: Colors.surfaceRaised,
  },
  medal: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  head: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  reject: {
    flexDirection: 'row',
    gap: Spacing.xs,
    padding: Spacing.sm,
    borderRadius: Radius.sm,
    backgroundColor: Colors.dangerSoft,
  },
});
