import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, View } from 'react-native';

import { Text } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { useTutor, type MakeResult } from '@/lib/tutor/store';

import { TutorErrorState } from './error-state';

type Kind = 'flashcards' | 'quiz';

/**
 * Asks the tutor to make flashcards or a quiz for an answer that doesn't have them yet (they're
 * made with AI on first use, then kept with the answer).
 */
export function useMadeFromAnswer(kind: Kind, conversationId: string, messageId: string, has: boolean) {
  const tutor = useTutor();
  const make = kind === 'flashcards' ? tutor.makeFlashcards : tutor.makeQuiz;
  const [result, setResult] = useState<MakeResult | 'making' | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (has || !conversationId || !messageId) return;
    let live = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- shows the spinner for the request this effect starts
    setResult('making');
    make(conversationId, messageId).then((r) => live && setResult(r));
    return () => {
      live = false;
    };
    // `make` changes every render; the request depends only on which answer and which attempt.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [has, conversationId, messageId, attempt]);

  return {
    making: !has && (result === 'making' || result === null),
    failed: !has && (result === 'error' || result === 'ok'),
    retry: () => setAttempt((n) => n + 1),
  };
}

/** Full-page state while the tutor makes them, or when that failed. */
export function MakingState({ kind, failed, onRetry, onBack }: { kind: Kind; failed: boolean; onRetry: () => void; onBack: () => void }) {
  const { t } = useTranslation('tutor');
  if (failed)
    return <TutorErrorState kind="server" title={t('making.failedTitle')} body={t('making.failedBody')} onRetry={onRetry} onBack={onBack} />;
  return (
    <View style={{ alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.xxl }} accessibilityLiveRegion="polite">
      <ActivityIndicator size="large" color={Colors.primary} />
      <Text variant="title" center>
        {t(kind === 'flashcards' ? 'making.flashcards' : 'making.quiz')}
      </Text>
      <Text color={Colors.textSecondary} center>
        {t('making.body')}
      </Text>
    </View>
  );
}
