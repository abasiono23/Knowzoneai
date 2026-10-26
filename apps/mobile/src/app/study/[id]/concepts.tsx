import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, TextInput, View } from 'react-native';

import { EmptyState } from '@/components/content/empty-state';
import { ReadyMaterial } from '@/components/materials/ready-material';
import { Card, Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Fonts, NoWebOutline, Radius, Spacing } from '@/constants/theme';

/** Screen 73: key concepts and definitions, A–Z with search. */
export default function ConceptsScreen() {
  const { t } = useTranslation('study');
  const [q, setQ] = useState('');
  return (
    <ReadyMaterial>
      {(m) => {
        const list = [...m.content.concepts]
          .sort((a, b) => a.term.localeCompare(b.term))
          .filter((c) => !q || `${c.term} ${c.definition}`.toLowerCase().includes(q.toLowerCase()));
        return (
          <Screen withTabBar={false}>
            <ScreenHeader
              eyebrow={t('concepts.eyebrow', { count: m.content.concepts.length })}
              eyebrowColor={Colors.success}
              title={m.title}
            />
            {m.content.concepts.length === 0 ? (
              <EmptyState icon="book" title={t('concepts.emptyTitle')} body={t('concepts.emptyBody')} />
            ) : (
              <>
                {m.content.concepts.length > 5 && (
                  <View style={styles.search}>
                    <Ionicons name="search" size={18} color={Colors.textMuted} />
                    <TextInput
                      value={q}
                      onChangeText={setQ}
                      placeholder={t('concepts.find')}
                      placeholderTextColor={Colors.textMuted}
                      style={styles.input}
                      accessibilityLabel={t('concepts.find')}
                    />
                  </View>
                )}
                {list.map((c) => (
                  <Card key={c.term} style={{ gap: 4 }}>
                    <Text variant="heading" color={Colors.success}>
                      {c.term}
                    </Text>
                    <Text>{c.definition}</Text>
                    {c.example && (
                      <Text variant="small" color={Colors.textSecondary}>
                        {t('concepts.example', { example: c.example })}
                      </Text>
                    )}
                  </Card>
                ))}
              </>
            )}
          </Screen>
        );
      }}
    </ReadyMaterial>
  );
}

const styles = StyleSheet.create({
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    minHeight: 46,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  input: { ...NoWebOutline, flex: 1, color: Colors.text, fontFamily: Fonts.regular, fontSize: 16, paddingVertical: 8 },
});
