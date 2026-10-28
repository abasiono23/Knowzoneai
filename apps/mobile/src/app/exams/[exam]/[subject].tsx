import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect, useLocalSearchParams, type Href } from 'expo-router';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { LoadError, Loading } from '@/components/exams/ui';
import { Button, Card, Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { errorText } from '@/i18n/errors';
import { examsApi, type ExamId, type ExamSubjectId, type PaperSummary } from '@/lib/exams';

/** One subject's papers: real past papers by year (when licensed) and numbered practice papers. */
export default function SubjectPapers() {
  const { t } = useTranslation('exams');
  const { exam, subject } = useLocalSearchParams<{ exam: ExamId; subject: ExamSubjectId }>();
  const [data, setData] = useState<{ topics: string[]; papers: PaperSummary[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);

  const load = useCallback(() => {
    setError(null);
    examsApi
      .papers(exam, subject)
      .then(setData)
      .catch((e) => setError(errorText(e, t('loadFailed'))));
  }, [exam, subject, t]);
  // Reload on return, so new scores show.
  useFocusEffect(load);

  const byYear = data?.papers.filter((p) => p.year !== null) ?? [];
  const practice = data?.papers.filter((p) => p.year === null) ?? [];
  const examName = t(`exams.${exam}.name` as 'exams.jamb.name');

  const row = (p: PaperSummary) => (
    <Pressable
      key={p.id}
      onPress={() => (p.locked ? setLocked(true) : router.push(`/exams/paper/${p.id}` as Href))}
      accessibilityRole="button"
      style={({ pressed }) => [pressed && { opacity: 0.85 }]}>
      <Card style={styles.paper}>
        <View style={[styles.badge, p.year ? styles.yearBadge : null]}>
          <Text style={{ fontFamily: Fonts.extrabold, fontSize: p.year ? 15 : 18, color: '#fff' }}>
            {p.year ?? p.number}
          </Text>
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="bodyStrong">
            {p.year ? t('paperYear', { exam: examName, year: p.year }) : t('paperNumber', { number: p.number })}
          </Text>
          <Text variant="small" color={Colors.textSecondary}>
            {t('paperMeta', { count: p.questions, minutes: p.minutes })}
          </Text>
          <Text variant="small" color={p.best != null ? Colors.success : Colors.textMuted}>
            {p.best != null ? t('best', { score: p.best, total: p.questions }) : t('notTried')}
          </Text>
        </View>
        {p.locked ? (
          <View style={styles.pro}>
            <Ionicons name="lock-closed" size={12} color="#3A2600" />
            <Text style={{ fontFamily: Fonts.extrabold, fontSize: 11, color: '#3A2600' }}>{t('pro')}</Text>
          </View>
        ) : (
          <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
        )}
      </Card>
    </Pressable>
  );

  return (
    <Screen withTabBar={false}>
      <ScreenHeader
        eyebrow={t(`exams.${exam}.full` as 'exams.jamb.full')}
        title={t(`subjects.${subject}` as 'subjects.english')}
      />
      {error ? (
        <LoadError text={error} onRetry={load} />
      ) : !data ? (
        <Loading />
      ) : (
        <>
          {locked && (
            <Card style={{ gap: Spacing.sm, borderColor: Colors.reward, borderWidth: 1 }}>
              <Text variant="bodyStrong">{t('lockedTitle')}</Text>
              <Text variant="small" color={Colors.textSecondary}>
                {t('lockedBody')}
              </Text>
              <Button title={t('seePro')} icon="sparkles" onPress={() => router.push('/billing')} />
            </Card>
          )}
          {byYear.length > 0 && (
            <View style={{ gap: Spacing.sm }}>
              <Text variant="label" color={Colors.reward}>
                {t('byYear')}
              </Text>
              {byYear.map(row)}
            </View>
          )}
          {practice.length > 0 && (
            <View style={{ gap: Spacing.sm }}>
              <Text variant="label" color={Colors.primary}>
                {t('practice')}
              </Text>
              <Text variant="small" color={Colors.textSecondary}>
                {t('practiceNote', { exam: examName })}
              </Text>
              {practice.map(row)}
            </View>
          )}
          <View style={{ gap: Spacing.xs }}>
            <Text variant="label" color={Colors.textSecondary}>
              {t('topics')}
            </Text>
            <View style={styles.topics}>
              {data.topics.map((topic) => (
                <View key={topic} style={styles.topic}>
                  <Text variant="small" color={Colors.textSecondary}>
                    {topic}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  paper: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  badge: {
    width: 52,
    height: 52,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
  },
  yearBadge: { backgroundColor: '#C98A00' },
  pro: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    backgroundColor: Colors.reward,
  },
  topics: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  topic: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.pill, backgroundColor: Colors.surface },
});
