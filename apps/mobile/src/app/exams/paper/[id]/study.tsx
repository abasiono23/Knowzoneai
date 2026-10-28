import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Explanation, LoadError, Loading, OptionRow, Passage, QuestionHead } from '@/components/exams/ui';
import { Button, Card, Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { errorText } from '@/i18n/errors';
import { LETTERS, loadPaper, type Paper } from '@/lib/exams';

/** Study mode: every question in the paper, with its answer and explanation (answers can be hidden). */
export default function StudyPaper() {
  const { t } = useTranslation('exams');
  const { id } = useLocalSearchParams<{ id: string }>();
  const [paper, setPaper] = useState<Paper | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [show, setShow] = useState(true);

  const load = useCallback(() => {
    loadPaper(id)
      .then(setPaper)
      .catch((e) => setError(errorText(e, t('loadFailed'))));
  }, [id, t]);
  useEffect(load, [load]);
  const retry = () => {
    setError(null);
    load();
  };

  return (
    <Screen withTabBar={false}>
      <ScreenHeader
        eyebrow={paper ? `${t(`exams.${paper.exam}.name`)} · ${t(`subjects.${paper.subject}`)}` : t('eyebrow')}
        title={t('paper.study.title')}
      />
      {paper && (
        <Button
          title={show ? t('study.hideAnswers') : t('study.showAnswers')}
          variant="secondary"
          icon={show ? 'eye-off' : 'eye'}
          onPress={() => setShow((s) => !s)}
        />
      )}
      {error ? (
        <LoadError text={error} onRetry={retry} />
      ) : !paper ? (
        <Loading />
      ) : (
        paper.questions.map((q, i) => (
          <View key={q.n} style={{ gap: Spacing.sm }}>
            {/* A passage is shown once, above the first question about it. */}
            {q.passage && q.passage !== paper.questions[i - 1]?.passage && <Passage text={q.passage} />}
            <Card style={{ gap: Spacing.sm }}>
              <QuestionHead q={q} label={t('sit.question', { n: q.n, total: paper.questions.length })} />
              {q.options.map((o, k) => (
                <OptionRow key={k} index={k} text={o} state={show && k === q.answer ? 'right' : 'idle'} />
              ))}
              {show && (
                <>
                  <Text variant="bodyStrong" color={Colors.success}>
                    {t('study.answer', { letter: LETTERS[q.answer] })}
                  </Text>
                  <Explanation title={t('study.why')} text={q.explanation} />
                </>
              )}
            </Card>
          </View>
        ))
      )}
    </Screen>
  );
}
