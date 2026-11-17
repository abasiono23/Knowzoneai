import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { RegionList } from '@/components/region-picker';
import { Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { errorText } from '@/i18n/errors';
import { api } from '@/lib/api';
import { regionOf } from '@/lib/region';
import { useSession } from '@/lib/session';

/** Study region: the country whose exam practice the app shows first. Saved as soon as it's chosen. */
export default function RegionSettingsScreen() {
  const { t } = useTranslation('settings');
  const { user, refresh } = useSession();
  const [chosen, setChosen] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const region = chosen ?? regionOf(user);

  const choose = async (code: string) => {
    if (code === region) return;
    setChosen(code);
    setError(null);
    try {
      await api.saveSettings({ region: code });
      // The home card, Past Questions and the tutor read the region from the account.
      await refresh();
    } catch (e) {
      setChosen(null);
      setError(errorText(e, t('errors.save')));
    }
  };

  return (
    <Screen withTabBar={false}>
      <ScreenHeader eyebrow={t('eyebrow')} title={t('region.title')} />
      <Text variant="small" color={Colors.textSecondary}>
        {t('region.intro')}
      </Text>
      {error && (
        <Text variant="small" color={Colors.danger} accessibilityLiveRegion="polite">
          {error}
        </Text>
      )}
      <RegionList value={region} onSelect={(code) => void choose(code)} />
      <View style={{ paddingHorizontal: 4, paddingBottom: Spacing.sm }}>
        <Text variant="small" color={Colors.textMuted} style={{ fontSize: 12 }}>
          {t('region.footer')}
        </Text>
      </View>
    </Screen>
  );
}
