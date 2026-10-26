import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { LanguageList } from '@/components/language-picker';
import { Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { useLanguage } from '@/i18n/provider';

/** Screen 192: language. One setting switches every screen and the AI tutor's explanations. */
export default function LanguageSettingsScreen() {
  const { t } = useTranslation('settings');
  const { language, changeLanguage } = useLanguage();

  return (
    <Screen withTabBar={false}>
      <ScreenHeader eyebrow={t('eyebrow')} title={t('language.title')} />
      <LanguageList value={language} onSelect={(l) => changeLanguage(l)} />
      <View style={{ paddingHorizontal: 4, paddingBottom: Spacing.sm }}>
        <Text variant="small" color={Colors.textMuted} style={{ fontSize: 12 }}>
          {t('language.footer')}
        </Text>
      </View>
    </Screen>
  );
}
