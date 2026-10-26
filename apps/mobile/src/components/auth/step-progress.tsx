import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { ProgressBar } from '@/components/ui';
import { Gradients } from '@/constants/theme';

export function StepProgress({ current, total }: { current: number; total: number }) {
  const { t } = useTranslation('auth');
  return (
    <View accessibilityLabel={t('shared.stepOf', { current, total })}>
      <ProgressBar progress={current / total} colors={Gradients.ai} height={6} />
    </View>
  );
}
