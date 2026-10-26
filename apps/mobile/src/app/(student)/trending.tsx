import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';

import { LessonCard } from '@/components/content/lesson-card';
import { ChoiceChip } from '@/components/personalize/choice-chip';
import { Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { formatNumber } from '@/i18n';
import { LESSONS, SUBJECTS, subjectName, trending } from '@/lib/catalog';

/** Screen 39: what's growing fastest this week, filterable by subject. */
export default function TrendingScreen() {
  const { t } = useTranslation('home');
  const [subject, setSubject] = useState<string | undefined>();
  const list = trending(subject);
  const subjectsWithLessons = SUBJECTS.filter((s) => LESSONS.some((l) => l.subjectId === s.id));

  return (
    <Screen withTabBar={false}>
      <ScreenHeader eyebrow={t('trending.eyebrow')} eyebrowColor={Colors.danger} title={t('trending.title')} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: Spacing.xs }}>
        <ChoiceChip label={t('trending.allSubjects')} selected={!subject} onPress={() => setSubject(undefined)} />
        {subjectsWithLessons.map((s) => (
          <ChoiceChip
            key={s.id}
            label={subjectName(s, t)}
            emoji={s.emoji}
            selected={subject === s.id}
            onPress={() => setSubject(subject === s.id ? undefined : s.id)}
          />
        ))}
      </ScrollView>
      <View style={{ gap: 2 }}>
        {list.map((l, i) => (
          <View key={l.id} style={styles.row}>
            <View style={{ flex: 1 }}>
              <LessonCard lesson={l} rank={i + 1} />
            </View>
            <View style={styles.trend}>
              <Ionicons name="trending-up" size={12} color={Colors.success} />
              <Text variant="label" color={Colors.success} style={{ fontSize: 10 }}>
                {formatNumber(l.trend / 100, { style: 'percent' })}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  trend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: Colors.successSoft,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: Radius.pill,
  },
});
