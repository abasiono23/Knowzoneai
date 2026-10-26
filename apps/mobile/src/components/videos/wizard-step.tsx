import { router, type Href } from 'expo-router';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { AuthScreen } from '@/components/auth/auth-screen';
import { Button, Text } from '@/components/ui';
import { Colors } from '@/constants/theme';

/** Frame for the five video-generation steps. */
export function WizardStep({
  step,
  title,
  subtitle,
  next,
  canContinue = true,
  continueLabel,
  onContinue,
  children,
}: {
  step: number;
  title: string;
  subtitle?: string;
  next?: string;
  canContinue?: boolean;
  continueLabel?: string;
  onContinue?: () => void;
  children: ReactNode;
}) {
  const { t } = useTranslation('videos');
  return (
    <AuthScreen
      step={{ current: step, total: 5 }}
      hero={
        <Text variant="label" color={Colors.primary}>
          {t('wizard.step', { step, total: 5 })}
        </Text>
      }
      title={title}
      subtitle={subtitle}
      footer={
        <Button
          title={continueLabel ?? t('actions.continue', { ns: 'common' })}
          icon={step === 5 ? 'sparkles' : undefined}
          disabled={!canContinue}
          onPress={() => {
            onContinue?.();
            if (next) router.push(next as Href);
          }}
        />
      }>
      {children}
    </AuthScreen>
  );
}
