import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect, useLocalSearchParams, type Href } from 'expo-router';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { LoadError, Loading } from '@/components/exams/ui';
import { Button, Card, Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { errorText } from '@/i18n/errors';
import { examsApi, loadPaper, type ExamAttempt, type Paper } from '@/lib/exams';

const MODES = [
  { id: 'study', icon: 'book', color: Colors.info },
  { id: 'practice', icon: 'checkmark-done', color: Colors.success },
  { id: 'timed', icon: 'timer', color: Colors.reward },
] as const;

/** A paper: choose to study it, practise it or sit it timed; past scores below. */
export default function PaperOverview() {
  const { t, i18n } = useTranslation('exams');
  const { id } = useLocalSearchParams<{ id: string }>();
  const [paper, setPaper] = useState<Paper | null>(null);
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [error, setError] = useState<{ text: string; pro: boolean } | null>(null);

  const load = useCallback(() => {
    setError(null);
    loadPaper(id)
      .then(setPaper)
      .catch((e) =>
        setError({ text: errorText(e, t('loadFailed')), pro: (e as { reason?: string }).reason === 'pro' }),
      );
    examsApi
      .attempts(id)
      .then((r) => setAttempts(r.attempts))
      .catch(() => {});
  }, [id, t]);
  useFocusEffect(load);

  const title = paper
    ? paper.year
      ? t('paperYear', { exam: t(`exams.${paper.exam}.name`), year: paper.year })
      : t('paperNumber', { number: paper.number })
    : t('title');

  return (
    <Screen withTabBar={false}>
      <ScreenHeader
        eyebrow={paper ? `${t(`exams.${paper.exam}.name`)} · ${t(`subjects.${paper.subject}`)}` : t('eyebrow')}
        title={title}
      />
      {error ? (
        error.pro ? (
          <Card style={{ gap: Spacing.sm }}>
            <Text variant="bodyStrong">{t('lockedTitle')}</Text>
            <Text variant="small" color={Colors.textSecondary}>
              {t('lockedBody')}
            </Text>
            <Button title={t('seePro')} icon="sparkles" onPress={() => router.push('/billing')} />
          </Card>
        ) : (
          <LoadError text={error.text} onRetry={load} />
        )
      ) : !paper ? (
        <Loading />
      ) : (
        <>
          <Card style={{ gap: 4 }}>
            <Text variant="bodyStrong">
              {t('paperMeta', { count: paper.questions.length, minutes: paper.minutes })}
            </Text>
            <Text variant="small" color={Colors.textSecondary}>
              {paper.source === 'licensed' && paper.credit
                ? t('paper.credit', { credit: paper.credit })
                : t('paper.original')}
            </Text>
          </Card>

          <Text variant="label" color={Colors.textSecondary}>
            {t('paper.modes')}
          </Text>
          {MODES.map((m) => (
            <Pressable
              key={m.id}
              onPress={() =>
                router.push(
                  (m.id === 'study' ? `/exams/paper/${id}/study` : `/exams/paper/${id}/sit?mode=${m.id}`) as Href,
                )
              }
              accessibilityRole="button"
              style={({ pressed }) => [pressed && { opacity: 0.85 }]}>
              <Card style={styles.mode}>
                <View style={[styles.icon, { backgroundColor: `${m.color}22` }]}>
                  <Ionicons name={m.icon} size={22} color={m.color} />
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text variant="bodyStrong">{t(`paper.${m.id}.title`)}</Text>
                  <Text variant="small" color={Colors.textSecondary}>
                    {t(`paper.${m.id}.body`, { minutes: paper.minutes })}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
              </Card>
            </Pressable>
          ))}

          {attempts.length > 0 && (
            <View style={{ gap: Spacing.xs }}>
              <Text variant="label" color={Colors.textSecondary}>
                {t('paper.history')}
              </Text>
              <Card style={{ gap: 6 }}>
                {attempts.map((a) => (
                  <Text key={a.id} variant="small">
                    {t('paper.historyRow', {
                      score: a.score,
                      total: a.total,
                      mode: t(`paper.modeName.${a.mode}`),
                      date: new Date(a.createdAt).toLocaleDateString(i18n.language),
                    })}
                  </Text>
                ))}
              </Card>
            </View>
          )}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  mode: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  icon: { width: 44, height: 44, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
});
