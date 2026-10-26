import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { LessonCard } from '@/components/content/lesson-card';
import { Card, Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { useLibrary } from '@/lib/library-store';
import { reasonText, recommend } from '@/lib/recommend';

/** Screen 40: personalized picks, grouped by why we picked them. */
export default function RecommendedScreen() {
  const { personalization, progress } = useLibrary();
  const { t } = useTranslation('home');
  const groups = useMemo(() => {
    const map = new Map<string, ReturnType<typeof recommend>>();
    recommend(personalization, progress, 20).forEach((r) => {
      const reason = reasonText(r.reason, t);
      map.set(reason, [...(map.get(reason) ?? []), r]);
    });
    return [...map.entries()];
  }, [personalization, progress, t]);

  return (
    <Screen withTabBar={false}>
      <ScreenHeader eyebrow={t('recommended.eyebrow')} eyebrowColor={Colors.success} title={t('recommended.title')} />
      {!personalization && (
        <Card style={{ flexDirection: 'row', gap: Spacing.sm, alignItems: 'center' }}>
          <Ionicons name="sparkles" size={20} color={Colors.primary} />
          <Text variant="small" color={Colors.textSecondary} style={{ flex: 1 }}>
            {t('recommended.popularHint')}
          </Text>
          <Text variant="small" color={Colors.primary} onPress={() => router.push('/profile')}>
            {t('recommended.setUp')}
          </Text>
        </Card>
      )}
      {groups.map(([reason, items]) => (
        <View key={reason} style={{ gap: Spacing.xs }}>
          <Text variant="label" color={Colors.success}>
            {reason.toUpperCase()}
          </Text>
          {items.map((r) => (
            <LessonCard key={r.lesson.id} lesson={r.lesson} progress={progress[r.lesson.id]} />
          ))}
        </View>
      ))}
    </Screen>
  );
}
