import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Button, Text } from '@/components/ui';
import { LinearGradient } from '@/components/ui/gradient';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { errorText } from '@/i18n/errors';
import { booksApi, SUBJECT_LOOK, type SchoolClass, type Stream, type SubjectShelf } from '@/lib/books';

/** A secondary student's subjects, one card each; a card opens that subject's books. */
export function SubjectShelves({ schoolClass, stream }: { schoolClass: SchoolClass; stream?: Stream }) {
  const { t } = useTranslation('books');
  const tx = t as unknown as (key: string, options?: Record<string, unknown>) => string;
  const [subjects, setSubjects] = useState<SubjectShelf[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    booksApi
      .subjects(schoolClass, stream)
      .then((r) => setSubjects(r.subjects))
      .catch((e) => setError(errorText(e, t('shelf.loadFailed'))));
  }, [schoolClass, stream, t]);
  useEffect(load, [load]);

  if (error)
    return (
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
    );
  if (!subjects) return <ActivityIndicator color={Colors.primary} style={{ marginTop: Spacing.lg }} />;

  return (
    <View style={{ gap: Spacing.sm }}>
      <Text variant="label" color={Colors.textSecondary}>
        {t('shelf.yourSubjects')}
      </Text>
      <View style={styles.grid}>
        {subjects.map((s, i) => {
          const look = SUBJECT_LOOK[s.id] ?? { icon: 'book' as const, colors: [Colors.primary, '#B04CFF'] as const };
          return (
            <Animated.View key={s.id} entering={FadeInDown.delay(i * 40).duration(350)} style={styles.cell}>
              <Pressable
                onPress={() => router.push(`/books/subject/${s.id}?class=${schoolClass}` as Href)}
                accessibilityRole="button"
                style={({ pressed }) => [styles.card, pressed && { transform: [{ scale: 0.97 }] }]}>
                <LinearGradient colors={look.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.icon}>
                  <Ionicons name={look.icon} size={22} color="#fff" />
                </LinearGradient>
                <Text style={styles.name} numberOfLines={2}>
                  {tx(`subjects.${s.id}`)}
                </Text>
                <Text
                  variant="small"
                  color={s.books ? Colors.textSecondary : Colors.textMuted}
                  style={{ fontSize: 12 }}>
                  {s.books
                    ? s.free
                      ? tx('shelf.countFree', { count: s.books, free: s.free })
                      : tx('shelf.count', { count: s.books })
                    : t('shelf.none')}
                </Text>
              </Pressable>
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  cell: { width: '48%', flexGrow: 1 },
  card: {
    gap: 8,
    minHeight: 132,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  icon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  name: { fontFamily: Fonts.bold, fontSize: 15, lineHeight: 20, color: Colors.text },
});
