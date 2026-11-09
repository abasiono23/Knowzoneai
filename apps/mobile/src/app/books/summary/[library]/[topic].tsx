import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, View } from 'react-native';

import { Button, Card, Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { errorText } from '@/i18n/errors';
import { booksApi, summariesUnderReview, type Summary } from '@/lib/books';

/** One summary to read: a topic, or the whole course. */
export default function SummaryScreen() {
  const { t, i18n } = useTranslation('books');
  const { library, topic } = useLocalSearchParams<{ library: string; topic: string }>();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [english, setEnglish] = useState(false);

  const load = useCallback(() => {
    booksApi
      .summary(library, topic, english)
      .then((r) => setSummary(r.summary))
      .catch((e) => setError(errorText(e, t('shelf.summaryLoadFailed'))));
  }, [library, topic, english, t]);
  useEffect(load, [load]);

  return (
    <Screen withTabBar={false}>
      <ScreenHeader title={summary?.libraryName} />
      {error ? (
        <View style={{ gap: Spacing.sm, alignItems: 'center' }}>
          <Text variant="small" color={Colors.textSecondary} center>
            {error}
          </Text>
          <Button
            title={t('shelf.retry')}
            variant="secondary"
            onPress={() => {
              setError(null);
              load();
            }}
          />
        </View>
      ) : !summary ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: Spacing.lg }} />
      ) : (
        <>
          {/* Here rather than in the header, which cuts long titles to one line. */}
          <Text variant="display">{summary.title}</Text>
          {summary.translated && summariesUnderReview(i18n.language) && (
            <Card style={{ gap: Spacing.sm }}>
              <Text variant="small" color={Colors.textSecondary}>
                {t('shelf.summaryReviewing')}
              </Text>
              <Button
                title={english ? t('shelf.summaryReadTranslated') : t('shelf.summaryReadEnglish')}
                variant="secondary"
                onPress={() => setEnglish(!english)}
              />
            </Card>
          )}
          {!summary.translated && !english && !i18n.language.startsWith('en') && (
            <Text variant="small" color={Colors.textSecondary}>
              {t('shelf.summaryEnglishOnly')}
            </Text>
          )}
          {summary.sections.map((s) => (
            <View key={s.heading} style={{ gap: Spacing.xs }}>
              <Text variant="heading">{s.heading}</Text>
              <Text>{s.text}</Text>
            </View>
          ))}
          <Card style={{ gap: Spacing.xs }}>
            <Text variant="label" color={Colors.primary}>
              {t('shelf.summaryKeyPoints')}
            </Text>
            {summary.keyPoints.map((p) => (
              <View key={p} style={{ flexDirection: 'row', gap: Spacing.xs }}>
                <Text color={Colors.primary}>•</Text>
                <Text style={{ flex: 1 }}>{p}</Text>
              </View>
            ))}
          </Card>
        </>
      )}
    </Screen>
  );
}
