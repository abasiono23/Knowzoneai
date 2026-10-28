import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { LoadError, Loading } from '@/components/exams/ui';
import { Card, Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { errorText } from '@/i18n/errors';
import { USE_MOCKS } from '@/lib/config';
import { EXAM_IDS, examsApi, SUBJECT_ICONS, type ExamId, type ExamsOverview } from '@/lib/exams';

/** Past Questions: choose JAMB, WAEC or NECO, then a subject. */
export default function ExamsHome() {
  const { t } = useTranslation('exams');
  const params = useLocalSearchParams<{ exam?: string }>();
  const [exam, setExam] = useState<ExamId>(EXAM_IDS.includes(params.exam as ExamId) ? (params.exam as ExamId) : 'jamb');
  const [data, setData] = useState<ExamsOverview | null>(null);
  const [error, setError] = useState<string | null>(USE_MOCKS ? t('offline') : null);

  const load = useCallback(() => {
    if (USE_MOCKS) return;
    examsApi
      .overview()
      .then(setData)
      .catch((e) => setError(errorText(e, t('loadFailed'))));
  }, [t]);
  useEffect(load, [load]);
  const retry = () => {
    setError(null);
    load();
  };

  const subjects = data?.exams.find((e) => e.id === exam)?.subjects ?? [];

  return (
    <Screen withTabBar={false}>
      <ScreenHeader eyebrow={t('eyebrow')} title={t('title')} />

      <Text variant="label" color={Colors.textSecondary}>
        {t('pickExam')}
      </Text>
      <View style={styles.exams}>
        {EXAM_IDS.map((id) => {
          const on = id === exam;
          return (
            <Pressable
              key={id}
              onPress={() => setExam(id)}
              accessibilityRole="tab"
              accessibilityState={{ selected: on }}
              accessibilityLabel={t(`exams.${id}.full`)}
              style={[styles.exam, on && styles.examOn]}>
              <Text style={{ fontFamily: Fonts.extrabold, fontSize: 18, color: on ? '#fff' : Colors.text }}>
                {t(`exams.${id}.name`)}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Text variant="small" color={Colors.textSecondary}>
        {t(`exams.${exam}.full`)} · {t(`exams.${exam}.about`)}
      </Text>

      <Text variant="label" color={Colors.textSecondary} style={{ marginTop: Spacing.sm }}>
        {t('pickSubject')}
      </Text>
      {error ? (
        <LoadError text={error} onRetry={retry} />
      ) : !data ? (
        <Loading />
      ) : (
        <View style={{ gap: Spacing.sm }}>
          {subjects.map((s) => {
            const look = SUBJECT_ICONS[s.id];
            return (
              <Pressable
                key={s.id}
                onPress={() => router.push(`/exams/${exam}/${s.id}` as Href)}
                disabled={!s.papers}
                accessibilityRole="button"
                style={({ pressed }) => [pressed && { opacity: 0.85 }]}>
                <Card style={[styles.subject, !s.papers && { opacity: 0.5 }]}>
                  <View style={[styles.icon, { backgroundColor: `${look.color}22` }]}>
                    <Ionicons name={look.icon as keyof typeof Ionicons.glyphMap} size={22} color={look.color} />
                  </View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text variant="bodyStrong">{t(`subjects.${s.id}`)}</Text>
                    <Text variant="small" color={Colors.textSecondary}>
                      {s.papers ? t('subjectMeta', { count: s.papers, questions: s.questions }) : t('noPapers')}
                    </Text>
                    {s.years.length > 0 && (
                      <Text variant="small" color={Colors.reward}>
                        {t('years', { years: s.years.join(', ') })}
                      </Text>
                    )}
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
                </Card>
              </Pressable>
            );
          })}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  exams: { flexDirection: 'row', gap: Spacing.sm },
  exam: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  examOn: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  subject: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  icon: { width: 44, height: 44, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
});
