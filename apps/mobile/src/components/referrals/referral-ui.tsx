import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { formatDate } from '@/i18n';
import type { Referral, ReferralStatus } from '@/lib/api';

/** Colour and icon per status; the label is `referrals:status.<status>`. */
export const STATUS: Record<ReferralStatus, { color: string; icon: keyof typeof Ionicons.glyphMap }> = {
  pending: { color: Colors.reward, icon: 'hourglass' },
  confirmed: { color: Colors.success, icon: 'checkmark-circle' },
  rejected: { color: Colors.danger, icon: 'close-circle' },
};

const GRADS: readonly [string, string][] = [
  ['#7C5CFF', '#B04CFF'],
  ['#14C8B4', '#4CC9FF'],
  ['#FF9F43', '#FF5A7A'],
  ['#FFC857', '#FF9F43'],
];

export function FriendAvatar({ name, size = 40 }: { name: string; size?: number }) {
  const g = GRADS[(name.charCodeAt(0) + name.length) % GRADS.length];
  return (
    <LinearGradient
      colors={g}
      style={{ width: size, height: size, borderRadius: size / 2, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: size * 0.4, color: '#fff', fontFamily: 'Manrope_800ExtraBold' }}>{name.charAt(0)}</Text>
    </LinearGradient>
  );
}

export function StatusBadge({ status }: { status: ReferralStatus }) {
  const s = STATUS[status];
  const { t } = useTranslation('referrals');
  return (
    <View style={[styles.badge, { backgroundColor: s.color + '22' }]}>
      <Ionicons name={s.icon} size={12} color={s.color} />
      <Text variant="label" color={s.color} style={{ fontSize: 10 }}>
        {t(`status.${status}`).toUpperCase()}
      </Text>
    </View>
  );
}

const day = (at: number) => formatDate(at, { day: 'numeric', month: 'short' });

/** The four steps from invite to reward, for one friend. */
export function ReferralSteps({
  joinedAt,
  emailVerified,
  qualifiedAt,
  status,
  credits,
  compact,
}: Pick<Referral, 'joinedAt' | 'emailVerified' | 'qualifiedAt' | 'status' | 'credits'> & { compact?: boolean }) {
  const { t } = useTranslation('referrals');
  const steps = [
    { id: 'joined', label: t('steps.joined'), done: true, meta: day(joinedAt) },
    { id: 'verified', label: t('steps.verified'), done: emailVerified, meta: emailVerified ? '' : t('steps.waiting') },
    {
      id: 'qualified',
      label: t('steps.qualified'),
      done: !!qualifiedAt,
      meta: qualifiedAt ? day(qualifiedAt) : status === 'pending' ? t('steps.waiting') : '',
    },
    {
      id: 'reward',
      label: t('steps.reward', { credits }),
      done: status === 'confirmed',
      meta: status === 'confirmed' ? t('steps.paid') : '',
    },
  ];
  const rejected = status === 'rejected';
  return (
    <View style={{ gap: compact ? 4 : Spacing.xs }}>
      {steps.map((s, k) => {
        const blocked = rejected && !s.done;
        return (
          <View key={s.id} style={styles.step}>
            <View style={styles.rail}>
              <View style={[styles.dot, s.done && styles.dotDone, blocked && styles.dotBlocked]}>
                <Ionicons
                  name={s.done ? 'checkmark' : blocked ? 'close' : 'ellipse'}
                  size={s.done || blocked ? 11 : 6}
                  color={s.done || blocked ? Colors.backgroundDeep : Colors.textMuted}
                />
              </View>
              {k < steps.length - 1 && <View style={[styles.line, s.done && steps[k + 1].done && styles.lineDone]} />}
            </View>
            <View style={styles.stepText}>
              <Text
                variant="small"
                color={s.done ? Colors.text : Colors.textSecondary}
                style={{ flex: 1, fontSize: compact ? 12 : 14 }}>
                {s.label}
              </Text>
              {!!s.meta && (
                <Text variant="small" color={s.done ? Colors.textMuted : Colors.reward} style={{ fontSize: 11 }}>
                  {s.meta}
                </Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.pill,
    alignSelf: 'flex-start',
  },
  step: { flexDirection: 'row', gap: Spacing.sm },
  rail: { alignItems: 'center', width: 20 },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotDone: { backgroundColor: Colors.success },
  dotBlocked: { backgroundColor: Colors.danger },
  line: { width: 2, flex: 1, minHeight: 10, backgroundColor: Colors.surfaceRaised },
  lineDone: { backgroundColor: Colors.success },
  stepText: { flex: 1, flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.xs, paddingBottom: 6 },
});
