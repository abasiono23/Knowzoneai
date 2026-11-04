import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Button, Card, Text } from '@/components/ui';
import { LinearGradient } from '@/components/ui/gradient';
import { Colors, Gradients, Radius, Spacing } from '@/constants/theme';
import { errorText } from '@/i18n/errors';
import { useFlipStyle } from '@/i18n/provider';
import { booksApi, OTHER_COURSE } from '@/lib/books';

/**
 * A university, polytechnic or college student's course books: one card with how many there are,
 * opening the course's shelf. Courses typed in by the student (or without books yet) say they're coming.
 */
export function CourseShelf({ course, stage }: { course: string; stage: string }) {
  const { t } = useTranslation('books');
  const tx = t as unknown as (key: string, options?: Record<string, unknown>) => string;
  const flip = useFlipStyle();
  const [counts, setCounts] = useState<{ books: number; free: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    if (course === OTHER_COURSE) return;
    booksApi
      .course(course, stage)
      .then((r) => setCounts({ books: r.books.length, free: r.free }))
      .catch((e) => setError(errorText(e, t('shelf.loadFailed'))));
  }, [course, stage, t]);
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
  if (course !== OTHER_COURSE && !counts)
    return <ActivityIndicator color={Colors.primary} style={{ marginTop: Spacing.lg }} />;

  if (!counts?.books)
    return (
      <Card style={styles.soon}>
        <View style={styles.bookIcon}>
          <Ionicons name="book" size={34} color={Colors.primary} />
        </View>
        <Text variant="heading" center>
          {t('done.soon')}
        </Text>
        <Text variant="small" color={Colors.textSecondary} center>
          {t('done.soonBody')}
        </Text>
      </Card>
    );

  return (
    <Animated.View entering={FadeInDown.duration(350)}>
      <Pressable
        onPress={() => router.push(`/books/subject/${course}?stage=${stage}` as Href)}
        accessibilityRole="button"
        style={({ pressed }) => [styles.card, pressed && { transform: [{ scale: 0.98 }] }]}>
        <LinearGradient colors={Gradients.mastery} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.icon}>
          <Ionicons name="library" size={26} color="#fff" />
        </LinearGradient>
        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="bodyStrong">{t('shelf.courseBooks')}</Text>
          <Text variant="small" color={Colors.textSecondary}>
            {counts.free
              ? tx('shelf.countFree', { count: counts.books, free: counts.free })
              : tx('shelf.count', { count: counts.books })}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} style={flip} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  soon: { alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.xl },
  bookIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primarySoft,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  icon: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
});
