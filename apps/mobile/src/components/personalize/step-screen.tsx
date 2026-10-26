import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { AuthScreen } from '@/components/auth/auth-screen';
import { Button, Text } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { nextStep, stepNumber, stepsFor, type Step } from '@/lib/personalization';
import { usePersonalization } from '@/lib/personalization-store';

type Props = {
  step: Step;
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
  canContinue?: boolean;
  /** Shown under the button, e.g. "3 selected". */
  helper?: string;
  /** Optional steps get a "Skip" action. */
  skippable?: boolean;
  continueLabel?: string;
  onContinue?: () => void;
  onSkip?: () => void;
};

/** Shared frame for personalization steps 18–30: progress, title, content and a pinned Continue. */
export function StepScreen({
  step,
  title,
  subtitle,
  children,
  canContinue = true,
  helper,
  skippable,
  continueLabel,
  onContinue,
  onSkip,
}: Props) {
  const { t } = useTranslation('personalize');
  const { edit } = useLocalSearchParams<{ edit?: string }>();
  const editing = edit === '1';
  const { profile } = usePersonalization();
  const type = profile.learnerType;
  const total = stepsFor(type).length;
  const number = stepNumber(step, type);
  const next = `/personalize/${nextStep(step, type)}` as Href;

  const go = () => {
    Haptics.selectionAsync().catch(() => {});
    onContinue?.();
    if (editing) router.back();
    else router.push(next);
  };

  return (
    <AuthScreen
      step={{ current: number, total }}
      hero={
        <Text variant="label" color={Colors.primary}>
          {editing ? t('editing') : t('stepOf', { current: number, total })}
        </Text>
      }
      title={title}
      subtitle={subtitle}
      footer={
        <>
          {helper && (
            <Text variant="small" color={Colors.textSecondary} center>
              {helper}
            </Text>
          )}
          <Button
            title={editing ? t('saveChanges') : (continueLabel ?? t('actions.continue', { ns: 'common' }))}
            onPress={go}
            disabled={!canContinue}
          />
          {skippable && !editing && (
            <Button
              variant="ghost"
              title={t('actions.skipForNow', { ns: 'common' })}
              onPress={() => {
                onSkip?.();
                router.push(next);
              }}
            />
          )}
        </>
      }>
      <View style={{ gap: Spacing.sm }}>{children}</View>
    </AuthScreen>
  );
}
