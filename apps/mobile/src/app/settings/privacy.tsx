import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { SettingsChoice, SettingsLink, SettingsSection, SettingsToggle } from '@/components/settings/rows';
import { Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors } from '@/constants/theme';
import type { AppSettings } from '@/lib/api';
import { useSession } from '@/lib/session';
import { useSettings } from '@/lib/settings';
import { useWorld } from '@/lib/world/store';

/** Labels are translated at render: privacy.visibility.<id>.label / .hint. */
const VISIBILITY: AppSettings['privacy']['profileVisibility'][] = ['everyone', 'school', 'private'];

/** Screen 194: privacy settings. */
export default function PrivacyScreen() {
  const { user } = useSession();
  const { settings, save, error } = useSettings();
  const world = useWorld();
  const { t } = useTranslation('settings');
  const student = user?.role !== 'teacher';
  if (!settings)
    return (
      <Screen withTabBar={false}>
        <ScreenHeader eyebrow={t('eyebrow')} title={t('privacy.title')} />
        <Text variant="small" color={error ? Colors.danger : Colors.textMuted}>
          {error ?? t('status.loading', { ns: 'common' })}
        </Text>
      </Screen>
    );
  const p = settings.privacy;
  const set = (patch: Partial<AppSettings['privacy']>) => save({ privacy: { ...p, ...patch } });

  return (
    <Screen withTabBar={false}>
      <ScreenHeader eyebrow={t('eyebrow')} title={t('privacy.title')} />
      <SettingsSection title={t('privacy.whoCanSee')}>
        {VISIBILITY.map((id, k) => (
          <SettingsChoice
            key={id}
            label={t(`privacy.visibility.${id}.label`)}
            hint={t(`privacy.visibility.${id}.hint`)}
            selected={p.profileVisibility === id}
            onPress={() => set({ profileVisibility: id })}
            last={k === VISIBILITY.length - 1}
          />
        ))}
      </SettingsSection>

      {student && (
        <SettingsSection title={t('privacy.leaderboards')} footer={t('privacy.leaderboardsFooter')}>
          <SettingsToggle
            icon="podium-outline"
            label={t('privacy.showOnLeaderboards')}
            value={world.settings.leaderboard}
            onChange={(leaderboard) => world.updateSettings({ leaderboard })}
            color={Colors.info}
          />
          <SettingsToggle
            icon="eye-off-outline"
            label={t('privacy.anonymous')}
            value={world.settings.anonymous}
            disabled={!world.settings.leaderboard}
            onChange={(anonymous) => world.updateSettings({ anonymous })}
            color={Colors.info}
            last
          />
        </SettingsSection>
      )}

      <SettingsSection title={t('privacy.dataUse')} footer={t('privacy.dataUseFooter')}>
        <SettingsToggle
          icon="sparkles-outline"
          label={t('privacy.recommendations')}
          hint={t('privacy.recommendationsHint')}
          value={p.personalisedRecommendations}
          onChange={(personalisedRecommendations) => set({ personalisedRecommendations })}
          color={Colors.success}
        />
        <SettingsToggle
          icon="analytics-outline"
          label={t('privacy.analytics')}
          hint={t('privacy.analyticsHint')}
          value={p.usageAnalytics}
          onChange={(usageAnalytics) => set({ usageAnalytics })}
          color={Colors.success}
        />
        <SettingsToggle
          icon="school-outline"
          label={t('privacy.improveAi')}
          hint={t('privacy.improveAiHint')}
          value={p.improveAi}
          onChange={(improveAi) => set({ improveAi })}
          color={Colors.success}
          last
        />
      </SettingsSection>

      <SettingsSection title={t('privacy.yourData')}>
        <SettingsLink
          icon="download-outline"
          label={t('home.downloadData')}
          onPress={() => router.push('/settings/data')}
          color={Colors.success}
        />
        <SettingsLink
          icon="trash-outline"
          label={t('home.deleteAccount')}
          onPress={() => router.push('/settings/delete')}
          danger
          last
        />
      </SettingsSection>
      {error && (
        <Text variant="small" color={Colors.danger}>
          {error}
        </Text>
      )}
    </Screen>
  );
}
