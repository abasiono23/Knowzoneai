import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from '@/components/ui/gradient';
import { router, type Href } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Share, StyleSheet, View } from 'react-native';

import { Coin, ProfileAvatar, TitleChip } from '@/components/rewards/reward-ui';
import { Button, Card, ProgressBar, Screen, SectionHeader, Text } from '@/components/ui';
import { Colors, Gradients, Radius, Spacing } from '@/constants/theme';
import { formatNumber } from '@/i18n';
import { MONTHLY_CREDITS, PLANS } from '@/lib/billing/plans';
import { useCourses } from '@/lib/courses/store';
import { useLibrary } from '@/lib/library-store';
import { useActivity } from '@/lib/rewards/activity';
import { useSession } from '@/lib/session';
import { useMaterials } from '@/lib/studio/store';
import { useVideos } from '@/lib/videos/store';

/** Names are translated at render: profile.badges.<id>. */
const BADGES: {
  id: 'firstPack' | 'streak3' | 'xp500' | 'streak7';
  icon: keyof typeof Ionicons.glyphMap;
  earned: (xp: number, streak: number) => boolean;
}[] = [
  { id: 'firstPack', icon: 'sparkles', earned: (xp) => xp > 0 },
  { id: 'streak3', icon: 'flame', earned: (_, s) => s >= 3 },
  { id: 'xp500', icon: 'star', earned: (xp) => xp >= 500 },
  { id: 'streak7', icon: 'medal', earned: (_, s) => s >= 7 },
];

/** Screen 177: the student's profile, and the hub for everything they've made and earned. */
export default function ProfileScreen() {
  const { user } = useSession();
  const [now] = useState(() => Date.now());
  const { current: streak } = useActivity(now);
  const courses = useCourses();
  const lib = useLibrary();
  const { materials } = useMaterials();
  const { generated } = useVideos();
  const { t } = useTranslation('settings');
  if (!user) return null;

  const invite = () =>
    Share.share({
      message: t('profile.inviteMessage', { code: user.referralCode }),
    });

  const inProgress = Object.keys(courses.enrolled).length;
  const certs = Object.keys(courses.certificates).length;
  const saved = materials.filter((m) => m.saved && m.status === 'ready').length + lib.saved.length;
  const videos = generated.filter((v) => v.status === 'ready').length;
  const meta = [user.school, user.grade].filter(Boolean).join(' · ');

  const tiles: { icon: keyof typeof Ionicons.glyphMap; label: string; meta: string; href: string; color: string }[] = [
    {
      icon: 'stats-chart',
      label: t('profile.tiles.stats'),
      meta: t('units.level', { ns: 'common', level: user.level }),
      href: '/me/stats',
      color: Colors.primary,
    },
    {
      icon: 'school',
      label: t('profile.tiles.courses'),
      meta: t('profile.tiles.enrolled', { count: inProgress }),
      href: '/me/courses',
      color: Colors.info,
    },
    {
      icon: 'ribbon',
      label: t('profile.tiles.certificates'),
      meta: t('profile.tiles.earned', { count: certs }),
      href: '/me/certificates',
      color: Colors.reward,
    },
    {
      icon: 'bookmark',
      label: t('profile.tiles.saved'),
      meta: t('profile.tiles.items', { count: saved }),
      href: '/me/saved',
      color: Colors.success,
    },
    {
      icon: 'videocam',
      label: t('profile.tiles.videos'),
      meta: t('profile.tiles.made', { count: videos }),
      href: '/me/videos',
      color: Colors.danger,
    },
    {
      icon: 'flag',
      label: t('profile.tiles.goals'),
      meta: t('profile.tiles.perDay', { count: user.dailyGoalMinutes }),
      href: '/me/goals',
      color: '#FF9F43',
    },
  ];

  return (
    <Screen>
      <View style={styles.top}>
        <Text variant="label" color={Colors.primary}>
          {t('me.eyebrow')}
        </Text>
        <Pressable
          onPress={() => router.push('/settings')}
          accessibilityRole="button"
          accessibilityLabel={t('home.title')}
          hitSlop={8}
          style={styles.gear}>
          <Ionicons name="settings-outline" size={20} color={Colors.text} />
        </Pressable>
      </View>

      <LinearGradient colors={Gradients.aiGlow} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        <Pressable
          onPress={() => router.push('/settings/photo')}
          accessibilityRole="button"
          accessibilityLabel={t('editProfile.changePhotoA11y')}>
          <ProfileAvatar size={96} />
          <View style={styles.camera}>
            <Ionicons name="camera" size={14} color={Colors.onBright} />
          </View>
        </Pressable>
        <Text variant="title" center>
          {user.name}
        </Text>
        {!!user.username && (
          <Text variant="small" color="rgba(255,255,255,0.8)">
            @{user.username}
          </Text>
        )}
        <TitleChip />
        {!!meta && (
          <Text variant="small" color="rgba(255,255,255,0.9)">
            {meta}
          </Text>
        )}
        {!!user.bio && (
          <Text variant="small" color="rgba(255,255,255,0.85)" center>
            {user.bio}
          </Text>
        )}
        <View style={{ alignSelf: 'stretch', gap: 6 }}>
          <View style={styles.between}>
            <Text variant="label" color="rgba(255,255,255,0.85)">
              {user.plan === 'FREE'
                ? t('profile.levelFree', { level: user.level })
                : t('profile.levelPlan', { level: user.level, plan: user.plan })}
            </Text>
            <Text variant="label" color="rgba(255,255,255,0.85)">
              {t('units.xp', { ns: 'common', count: user.xp })}
            </Text>
          </View>
          <ProgressBar progress={user.levelProgress} colors={Gradients.reward} height={8} />
        </View>
        <Button
          variant="secondary"
          title={t('home.editProfile')}
          icon="create-outline"
          onPress={() => router.push('/settings/edit-profile')}
          style={{ alignSelf: 'stretch' }}
        />
      </LinearGradient>

      <View style={styles.stats}>
        <Stat
          icon="flame"
          color={Colors.danger}
          value={streak}
          label={t('profile.dayStreak')}
          onPress={() => router.push('/rewards/streak')}
        />
        <Stat
          icon="ellipse"
          color={Colors.reward}
          value={user.coins}
          label={t('profile.coins')}
          onPress={() => router.push('/rewards/wallet')}
        />
        <Stat
          icon="flash"
          color={Colors.primary}
          value={user.aiCredits}
          label={t('profile.aiCredits')}
          onPress={() => router.push('/referrals/history')}
        />
      </View>

      <View style={{ gap: Spacing.sm }}>
        <Text variant="heading">{t('profile.myLearning')}</Text>
        <View style={styles.grid}>
          {tiles.map((tile) => (
            <Pressable
              key={tile.href}
              onPress={() => router.push(tile.href as Href)}
              accessibilityRole="button"
              accessibilityLabel={t('rows.labelValue', { label: tile.label, value: tile.meta })}
              style={({ pressed }) => [styles.tile, pressed && { opacity: 0.8 }]}>
              <View style={[styles.tileIcon, { backgroundColor: tile.color + '22' }]}>
                <Ionicons name={tile.icon} size={20} color={tile.color} />
              </View>
              <Text variant="bodyStrong" style={{ fontSize: 14 }}>
                {tile.label}
              </Text>
              <Text variant="small" color={Colors.textMuted} style={{ fontSize: 11 }}>
                {tile.meta}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <Pressable
        onPress={() => router.push('/rewards')}
        accessibilityRole="button"
        accessibilityLabel={t('profile.rewards')}>
        <Card style={styles.rewards}>
          <Coin size={36} />
          <View style={{ flex: 1 }}>
            <Text variant="bodyStrong">{t('profile.rewards')}</Text>
            <Text variant="small" color={Colors.textSecondary}>
              {t('profile.rewardsHint')}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
        </Card>
      </Pressable>

      <View style={{ gap: Spacing.sm }}>
        <SectionHeader
          title={t('profile.badgesTitle')}
          action={t('actions.seeAll', { ns: 'common' })}
          onAction={() => router.push('/rewards/badges')}
        />
        <View style={styles.badges}>
          {BADGES.map((b) => {
            const earned = b.earned(user.xp, streak);
            return (
              <View key={b.id} style={[styles.badge, !earned && { opacity: 0.35 }]}>
                <LinearGradient
                  colors={earned ? Gradients.reward : [Colors.surfaceRaised, Colors.surfaceRaised]}
                  style={styles.badgeIcon}>
                  <Ionicons name={b.icon} size={24} color={earned ? Colors.onBright : Colors.textMuted} />
                </LinearGradient>
                <Text variant="label" center>
                  {t(`profile.badges.${b.id}`)}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      <Card raised style={{ gap: Spacing.sm }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
          <Ionicons name="gift" size={24} color={Colors.reward} />
          <View style={{ flex: 1 }}>
            <Text variant="bodyStrong">{t('profile.inviteTitle')}</Text>
            <Text variant="small" color={Colors.textSecondary}>
              {t('profile.inviteBody')}
            </Text>
          </View>
        </View>
        <View style={styles.code}>
          <Text variant="title" style={{ letterSpacing: 4 }}>
            {user.referralCode}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
          <Button title={t('profile.shareInvite')} icon="share-social" onPress={invite} style={{ flex: 1 }} />
          <Button
            variant="secondary"
            title={t('profile.myReferrals')}
            icon="people"
            onPress={() => router.push('/referrals')}
            style={{ flex: 1 }}
          />
        </View>
      </Card>

      <Pressable
        onPress={() => router.push(user.plan === 'FREE' ? '/billing' : '/billing/manage')}
        accessibilityRole="button"
        accessibilityLabel={user.plan === 'FREE' ? t('profile.goPlus') : t('profile.manageSubscription')}>
        {user.plan === 'FREE' ? (
          <LinearGradient colors={Gradients.reward} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.upgrade}>
            <View style={{ flex: 1, gap: 4 }}>
              <Text variant="heading" color={Colors.onBright}>
                {t('profile.goPlus')}
              </Text>
              <Text variant="small" color={Colors.onBright}>
                {t('profile.goPlusBody', { credits: MONTHLY_CREDITS.PLUS })}
              </Text>
            </View>
            <Ionicons name="arrow-forward-circle" size={32} color={Colors.onBright} />
          </LinearGradient>
        ) : (
          <LinearGradient
            colors={PLANS[user.plan].colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.upgrade}>
            <View style={{ flex: 1, gap: 4 }}>
              <Text variant="heading">{PLANS[user.plan].name}</Text>
              <Text variant="small" color="rgba(255,255,255,0.9)">
                {t('profile.manageBody')}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color={Colors.text} />
          </LinearGradient>
        )}
      </Pressable>

      <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
        <Button
          variant="secondary"
          title={t('home.title')}
          icon="settings-outline"
          onPress={() => router.push('/settings')}
          style={{ flex: 1 }}
        />
        <Button
          variant="secondary"
          title={t('profile.help')}
          icon="help-buoy-outline"
          onPress={() => router.push('/help')}
          style={{ flex: 1 }}
        />
      </View>
    </Screen>
  );
}

function Stat({
  icon,
  color,
  value,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  value: number;
  label: string;
  onPress?: () => void;
}) {
  const { t } = useTranslation('settings');
  const card = (
    <Card style={{ flex: 1, alignItems: 'center', gap: 4 }}>
      <Ionicons name={icon} size={22} color={color} />
      <Text variant="title">{formatNumber(value)}</Text>
      <Text variant="small" color={Colors.textSecondary}>
        {label}
      </Text>
    </Card>
  );
  if (!onPress) return card;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={t('stats.tileA11y', { value: formatNumber(value), label })}
      style={{ flex: 1 }}>
      {card}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  gear: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: { borderRadius: Radius.xl, padding: Spacing.lg, alignItems: 'center', gap: Spacing.xs },
  camera: {
    position: 'absolute',
    right: 2,
    bottom: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  between: { flexDirection: 'row', justifyContent: 'space-between' },
  stats: { flexDirection: 'row', gap: Spacing.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  tile: {
    width: '31.5%',
    flexGrow: 1,
    gap: 4,
    padding: Spacing.sm,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tileIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  rewards: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, borderColor: Colors.reward + '55' },
  badges: { flexDirection: 'row', justifyContent: 'space-between' },
  badge: { alignItems: 'center', gap: 6, width: '23%' },
  badgeIcon: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  code: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Colors.reward,
    backgroundColor: Colors.rewardSoft,
  },
  upgrade: {
    borderRadius: Radius.lg,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
});
