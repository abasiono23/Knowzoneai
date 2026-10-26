import { useTranslation } from 'react-i18next';

import { LanguageList } from '@/components/language-picker';
import { StepScreen } from '@/components/personalize/step-screen';
import { Text } from '@/components/ui';
import { Colors } from '@/constants/theme';
import { useLanguage } from '@/i18n/provider';
import { usePersonalization } from '@/lib/personalization-store';

/** Choosing a language here switches the whole app (and the AI tutor) right away. */
export default function LanguageScreen() {
  const { update } = usePersonalization();
  const { language, changeLanguage } = useLanguage();
  const { t } = useTranslation('personalize');

  return (
    <StepScreen
      step="language"
      title={t('language.title')}
      subtitle={t('language.subtitle')}
      // The app may already be in the phone's language; keep the profile in step with it.
      onContinue={() => update({ language })}>
      <LanguageList
        value={language}
        onSelect={(id) => {
          changeLanguage(id);
          update({ language: id });
        }}
      />
      <Text variant="small" color={Colors.textMuted} center>
        {t('language.betaNote')}
      </Text>
    </StepScreen>
  );
}
