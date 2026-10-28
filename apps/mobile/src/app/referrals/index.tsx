import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { LinearGradient } from '@/components/ui/gradient';
import { router, type Href } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Share, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { FriendAvatar, StatusBadge } from '@/components/referrals/referral-ui';
import { TutorErrorState } from '@/components/tutor/error-state';
import { Button, Card, ProgressBar, Screen, ScreenHeader, SectionHeader, Text } from '@/components/ui';
import { Colors, Gradients, Radius, Spacing } from '@/constants/theme';
import { formatDate } from '@/i18n';
import { inviteMessage, TEMPLATES } from '@/lib/referrals/messages';
import { recordInviteSent, useReferrals } from '@/lib/referrals/use-referrals';

/** Screen 169: referral dashboard. */
export default function ReferralDashboard() {
  const { data, error, refresh } = useReferrals();
  const [copied, setCopied] = useState(false);
  const { t } = useTranslation('referrals');

  if (error && !data)
    return (
      <Screen withTabBar={false}>
        <ScreenHeader eyebrow={t('inviteEyebrow')} />
        <TutorErrorState kind="network" body={error} onRetry={refresh} />
      </Screen>
    );
  if (!data)
    return (
      <Screen withTabBar={false}>
        <ScreenHeader eyebrow={t('inviteEyebrow')} title={t('status.loading', { ns: 'common' })} />
      </Screen>
    );

  const confirmed = data.referrals.filter((r) => r.status === 'confirmed');
  const pending = data.referrals.filter((r) => r.status === 'pending');
  const earned = data.credits.filter((c) => c.reason === 'referral-inviter').reduce((n, c) => n + c.credits, 0);

  const copy = async () => {
    await Clipboard.setStringAsync(data.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };
  const share = async () => {
    await Share.share({ message: inviteMessage(TEMPLATES[0].id, data.code, data.link, data.rewardCredits) }).catch(
      () => {},
    );
    recordInviteSent('share');
  };

  return (
    <Screen withTabBar={false}>
      <ScreenHeader eyebrow={t('inviteEyebrow')} title={t('dashboard.title')} />
      <LinearGradient
        colors={['#3B2DBF', '#7C5CFF', '#2DD4BF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}>
        <Text style={{ fontSize: 44 }}>🎁</Text>
        <Text variant="title" color="#fff" center>
          {t('dashboard.headline', { credits: data.rewardCredits })}
        </Text>
        <Text color="rgba(255,255,255,0.88)" center>
          {t('dashboard.body', { credits: data.rewardCredits })}
        </Text>
        <View style={styles.code}>
          <Pressable
            onPress={() => router.push('/referrals/code')}
            accessibilityRole="button"
            accessibilityLabel={t('dashboard.codeA11y', { code: data.code })}
            style={{ flex: 1 }}>
            <Text variant="label" color="rgba(255,255,255,0.7)">
              {t('dashboard.yourCode')}
            </Text>
            <Text style={styles.codeText}>{data.code}</Text>
          </Pressable>
          <Pressable
            onPress={copy}
            accessibilityRole="button"
            accessibilityLabel={t('dashboard.copyCode')}
            hitSlop={8}
            style={styles.copy}>
            <Ionicons name={copied ? 'checkmark' : 'copy-outline'} size={18} color={Colors.onBright} />
            <Text variant="label" color={Colors.onBright}>
              {copied ? t('dashboard.copied') : t('dashboard.copy')}
            </Text>
          </Pressable>
        </View>
        <View style={{ gap: Spacing.xs, alignSelf: 'stretch' }}>
          <Button title={t('dashboard.invite')} icon="paper-plane" onPress={() => router.push('/referrals/invite')} />
          <Button variant="secondary" title={t('dashboard.shareCode')} icon="share-social" onPress={share} />
        </View>
      </LinearGradient>

      {data.invitedBy && data.invitedBy.status === 'pending' && (
        <Animated.View entering={FadeIn}>
          <Pressable
            onPress={() => router.push('/referrals/status')}
            accessibilityRole="button"
            accessibilityLabel={t('dashboard.pendingA11y')}>
            <Card style={styles.invited}>
              <Ionicons name="hourglass" size={22} color={Colors.reward} />
              <View style={{ flex: 1 }}>
                <Text variant="bodyStrong">{t('dashboard.pendingTitle')}</Text>
                <Text variant="small" color={Colors.textSecondary}>
                  {t('dashboard.pendingBody', { credits: data.rewardCredits, name: data.invitedBy.inviterName })}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
            </Card>
          </Pressable>
        </Animated.View>
      )}

      <View style={styles.stats}>
        <Stat value={data.referrals.length} label={t('dashboard.stats.invited')} icon="people" color={Colors.info} />
        <Stat value={pending.length} label={t('dashboard.stats.pending')} icon="hourglass" color={Colors.reward} />
        <Stat
          value={confirmed.length}
          label={t('dashboard.stats.rewarded')}
          icon="checkmark-circle"
          color={Colors.success}
        />
        <Stat value={earned} label={t('dashboard.stats.credits')} icon="flash" color={Colors.primary} />
      </View>

      <Card style={{ gap: Spacing.xs }}>
        <View style={styles.between}>
          <Text variant="bodyStrong">{t('dashboard.thisMonth')}</Text>
          <Text variant="small" color={Colors.textSecondary}>
            {t('dashboard.monthCount', { count: data.confirmedThisMonth, cap: data.monthlyCap })}
          </Text>
        </View>
        <ProgressBar progress={data.confirmedThisMonth / data.monthlyCap} height={8} colors={Gradients.ai} />
        <Text variant="small" color={Colors.textMuted} style={{ fontSize: 12 }}>
          {t('dashboard.monthCap', { cap: data.monthlyCap })}
        </Text>
      </Card>

      <View style={{ gap: Spacing.sm }}>
        <SectionHeader
          title={t('dashboard.friends')}
          action={data.referrals.length ? t('dashboard.seeProgress') : undefined}
          onAction={() => router.push('/referrals/progress')}
        />
        {data.referrals.length === 0 ? (
          <Card style={{ alignItems: 'center', gap: Spacing.xs }}>
            <Ionicons name="people-outline" size={28} color={Colors.textMuted} />
            <Text variant="small" color={Colors.textSecondary} center>
              {t('dashboard.noFriends')}
            </Text>
          </Card>
        ) : (
          <Card style={{ gap: Spacing.md }}>
            {data.referrals.slice(0, 4).map((r) => (
              <Pressable
                key={r.id}
                onPress={() => router.push('/referrals/progress')}
                accessibilityRole="button"
                accessibilityLabel={t('dashboard.friendA11y', { name: r.friendName, status: t(`status.${r.status}`) })}
                style={styles.friend}>
                <FriendAvatar name={r.friendName} />
                <View style={{ flex: 1, gap: 2 }}>
                  <Text variant="bodyStrong">{r.friendName}</Text>
                  <Text variant="small" color={Colors.textMuted} style={{ fontSize: 12 }}>
                    {t('dashboard.joined', { date: formatDate(r.joinedAt, { day: 'numeric', month: 'short' }) })}
                  </Text>
                </View>
                <StatusBadge status={r.status} />
              </Pressable>
            ))}
          </Card>
        )}
      </View>

      <View style={styles.links}>
        {(
          [
            { id: 'history', icon: 'receipt-outline', label: t('dashboard.links.history'), href: '/referrals/history' },
            {
              id: 'eligibility',
              icon: 'shield-checkmark-outline',
              label: t('dashboard.links.eligibility'),
              href: '/referrals/status',
            },
            { id: 'terms', icon: 'document-text-outline', label: t('dashboard.links.terms'), href: '/referrals/terms' },
          ] as const
        ).map((l) => (
          <Pressable
            key={l.id}
            onPress={() => router.push(l.href as Href)}
            accessibilityRole="button"
            accessibilityLabel={l.label}
            style={styles.link}>
            <Ionicons name={l.icon} size={20} color={Colors.primary} />
            <Text variant="small" style={{ fontSize: 12 }}>
              {l.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

function Stat({
  value,
  label,
  icon,
  color,
}: {
  value: number;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}) {
  return (
    <Card style={styles.stat}>
      <Ionicons name={icon} size={18} color={color} />
      <Text variant="heading">{value}</Text>
      <Text variant="small" color={Colors.textMuted} style={{ fontSize: 11 }}>
        {label}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', gap: Spacing.sm, padding: Spacing.lg, borderRadius: Radius.xl },
  code: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.5)',
  },
  codeText: { fontFamily: 'Manrope_800ExtraBold', fontSize: 28, letterSpacing: 4, color: '#fff' },
  copy: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.pill,
    backgroundColor: '#fff',
  },
  invited: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, borderColor: Colors.reward + '66' },
  stats: { flexDirection: 'row', gap: Spacing.xs },
  stat: { flex: 1, alignItems: 'center', gap: 2, paddingHorizontal: 4, paddingVertical: Spacing.sm },
  between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  friend: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  links: { flexDirection: 'row', gap: Spacing.xs },
  link: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    padding: Spacing.sm,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
});
