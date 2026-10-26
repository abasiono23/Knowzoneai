import Constants from 'expo-constants';
import { router, type Href } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { ProfileAvatar } from '@/components/rewards/reward-ui';
import { SettingsLink, SettingsSection } from '@/components/settings/rows';
import { Card, Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { LANGUAGES } from '@/i18n';
import { useLanguage } from '@/i18n/provider';
import { TEXT_SCALES, useAppearance } from '@/lib/appearance';
import { PLANS } from '@/lib/billing/plans';
import { useSession } from '@/lib/session';
import { useSettings } from '@/lib/settings';

/** Screen 186: account settings. */
export default function AccountSettingsScreen() {
  const { user } = useSession();
  const { settings } = useSettings();
  const { appearance } = useAppearance();
  const { language } = useLanguage();
  const { t } = useTranslation('settings');
  if (!user) return null;
  const teacher = user.role === 'teacher';
  const go = (href: string) => () => router.push(href as Href);
  const provider =
    user.authProvider === 'google' ? 'Google' : user.authProvider === 'apple' ? 'Apple' : t('home.providerEmail');
  const textScale = TEXT_SCALES.find((s) => s.value === appearance.textScale)?.key ?? 'default';

  return (
    <Screen withTabBar={false}>
      <ScreenHeader eyebrow={t('home.eyebrow')} title={t('home.title')} />
      <Card style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.md }}>
        <ProfileAvatar size={60} />
        <View style={{ flex: 1 }}>
          <Text variant="heading">{user.name}</Text>
          <Text variant="small" color={Colors.textSecondary} numberOfLines={1}>
            {user.username ? `@${user.username} · ` : ''}
            {user.email}
          </Text>
        </View>
      </Card>

      <SettingsSection title={t('home.sections.profile')}>
        <SettingsLink icon="person-outline" label={t('home.editProfile')} onPress={go('/settings/edit-profile')} />
        <SettingsLink
          icon="image-outline"
          label={t('home.profilePhoto')}
          value={
            user.photo?.kind === 'photo'
              ? t('home.photoKinds.photo')
              : user.photo?.kind === 'initials'
                ? t('home.photoKinds.initials')
                : t('home.photoKinds.avatar')
          }
          onPress={go('/settings/photo')}
        />
        {!teacher && (
          <SettingsLink
            icon="flag-outline"
            label={t('home.learningGoals')}
            value={t('home.minutesADay', { count: user.dailyGoalMinutes })}
            onPress={go('/me/goals')}
            last
          />
        )}
      </SettingsSection>

      <SettingsSection title={t('home.sections.security')}>
        <SettingsLink
          icon="mail-outline"
          label={t('home.email')}
          value={user.email}
          onPress={go('/settings/connected')}
          color={Colors.info}
        />
        <SettingsLink
          icon="key-outline"
          label={t('home.changePassword')}
          value={user.authProvider === 'email' ? undefined : t('home.signedInWith', { provider })}
          onPress={go('/settings/password')}
          color={Colors.info}
        />
        <SettingsLink
          icon="link-outline"
          label={t('home.connectedAccounts')}
          onPress={go('/settings/connected')}
          color={Colors.info}
        />
        <SettingsLink
          icon="phone-portrait-outline"
          label={t('home.devices')}
          onPress={go('/settings/devices')}
          color={Colors.info}
          last
        />
      </SettingsSection>

      {!teacher && (
        <SettingsSection title={t('home.sections.subscription')}>
          <SettingsLink
            icon="diamond-outline"
            label={t('home.plan')}
            value={user.plan === 'FREE' ? t('home.planFree') : PLANS[user.plan].name}
            onPress={go('/billing/manage')}
            color={Colors.reward}
          />
          <SettingsLink
            icon="receipt-outline"
            label={t('home.billingHistory')}
            onPress={go('/billing/history')}
            color={Colors.reward}
          />
          <SettingsLink
            icon="help-buoy-outline"
            label={t('home.refunds')}
            onPress={go('/billing/support')}
            color={Colors.reward}
            last
          />
        </SettingsSection>
      )}

      <SettingsSection title={t('home.sections.preferences')}>
        <SettingsLink
          icon="notifications-outline"
          label={t('home.notifications')}
          value={settings ? (settings.notifications.push ? t('home.on') : t('home.off')) : undefined}
          onPress={go('/settings/notifications')}
          color={Colors.reward}
        />
        <SettingsLink
          icon="alarm-outline"
          label={t('home.reminders')}
          value={
            settings ? t('home.activeCount', { count: settings.reminders.filter((r) => r.enabled).length }) : undefined
          }
          onPress={go('/settings/reminders')}
          color={Colors.reward}
        />
        <SettingsLink
          icon="language-outline"
          label={t('home.language')}
          value={LANGUAGES.find((l) => l.id === language)?.native}
          onPress={go('/settings/language')}
          color={Colors.reward}
        />
        <SettingsLink
          icon="color-palette-outline"
          label={t('home.appearance')}
          value={t(`appearance.textSizes.${textScale}`)}
          onPress={go('/settings/appearance')}
          color={Colors.reward}
          last
        />
      </SettingsSection>

      <SettingsSection title={t('home.sections.privacy')}>
        <SettingsLink
          icon="shield-checkmark-outline"
          label={t('home.privacy')}
          onPress={go('/settings/privacy')}
          color={Colors.success}
        />
        <SettingsLink
          icon="download-outline"
          label={t('home.downloadData')}
          onPress={go('/settings/data')}
          color={Colors.success}
          last
        />
      </SettingsSection>

      <SettingsSection title={t('home.sections.help')}>
        <SettingsLink
          icon="help-buoy-outline"
          label={t('home.helpCentre')}
          onPress={go('/help')}
          color={Colors.success}
        />
        <SettingsLink
          icon="chatbubbles-outline"
          label={t('home.contactSupport')}
          onPress={go('/help/contact')}
          color={Colors.success}
        />
        <SettingsLink icon="bug-outline" label={t('home.reportBug')} onPress={go('/help/bug')} color={Colors.success} />
        <SettingsLink
          icon="bulb-outline"
          label={t('home.sendFeedback')}
          onPress={go('/help/feedback')}
          color={Colors.success}
        />
        <SettingsLink
          icon="ban-outline"
          label={t('home.blocked')}
          onPress={go('/help/blocked')}
          color={Colors.success}
        />
        <SettingsLink
          icon="shield-checkmark-outline"
          label={t('home.accountStatus')}
          value={
            user.restriction
              ? user.restriction.kind === 'suspended'
                ? t('home.statusSuspended')
                : t('home.statusLimited')
              : t('home.statusGood')
          }
          onPress={go('/account-status')}
          color={Colors.success}
          last
        />
      </SettingsSection>

      <SettingsSection title={t('home.sections.about')}>
        <SettingsLink
          icon="people-outline"
          label={t('home.guidelines')}
          onPress={go('/legal/guidelines')}
          color={Colors.textSecondary}
        />
        <SettingsLink
          icon="document-text-outline"
          label={t('home.terms')}
          onPress={go('/legal/terms')}
          color={Colors.textSecondary}
        />
        <SettingsLink
          icon="lock-closed-outline"
          label={t('home.privacyPolicy')}
          onPress={go('/legal/privacy')}
          color={Colors.textSecondary}
        />
        <SettingsLink
          icon="sparkles-outline"
          label={t('home.aiLimits')}
          onPress={go('/legal/ai')}
          color={Colors.textSecondary}
        />
        <SettingsLink
          icon="copy-outline"
          label={t('home.copyright')}
          onPress={go('/legal/copyright')}
          color={Colors.textSecondary}
          last
        />
      </SettingsSection>

      <SettingsSection>
        <SettingsLink
          icon="log-out-outline"
          label={t('home.logOut')}
          onPress={go('/settings/logout')}
          color={Colors.textSecondary}
        />
        <SettingsLink
          icon="trash-outline"
          label={t('home.deleteAccount')}
          onPress={go('/settings/delete')}
          danger
          last
        />
      </SettingsSection>

      <Text variant="small" color={Colors.textMuted} center>
        {t('home.version', { version: Constants.expoConfig?.version ?? '1.0.0' })}
      </Text>
    </Screen>
  );
}
