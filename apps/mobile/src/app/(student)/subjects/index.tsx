import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';

import { SubjectTile } from '@/components/content/subject-tile';
import { ChoiceChip } from '@/components/personalize/choice-chip';
import { Screen, ScreenHeader, Text } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { CATEGORIES, categoryName, subjectsIn } from '@/lib/catalog';

/** Screen 37: every subject, grouped by category. */
export default function SubjectCategoriesScreen() {
  const params = useLocalSearchParams<{ category?: string }>();
  const { t } = useTranslation('home');
  const [category, setCategory] = useState<string | null>(params.category ?? null);
  const shown = category ? CATEGORIES.filter((c) => c.id === category) : CATEGORIES;

  return (
    <Screen withTabBar={false}>
      <ScreenHeader eyebrow={t('subjects.eyebrow')} title={t('subjects.title')} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: Spacing.xs }}>
        <ChoiceChip label={t('subjects.all')} selected={!category} onPress={() => setCategory(null)} />
        {CATEGORIES.map((c) => (
          <ChoiceChip
            key={c.id}
            label={categoryName(c, t)}
            selected={category === c.id}
            onPress={() => setCategory(category === c.id ? null : c.id)}
          />
        ))}
      </ScrollView>

      {shown.map((c) => (
        <View key={c.id} style={{ gap: Spacing.sm }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.xs }}>
            <Ionicons name={c.icon} size={20} color={c.color} />
            <Text variant="heading">{categoryName(c, t)}</Text>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm }}>
            {subjectsIn(c.id).map((s) => (
              <SubjectTile key={s.id} subject={s} />
            ))}
          </View>
        </View>
      ))}
    </Screen>
  );
}
