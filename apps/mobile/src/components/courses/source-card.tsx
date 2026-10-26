import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Linking, Pressable, StyleSheet, View } from 'react-native';

import { Card, Text } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import type { CourseSource } from '@/lib/courses/types';

/**
 * Credits the open textbook a course is adapted from, with its authors and licence. The CC BY
 * licence requires this attribution wherever the content is shown.
 */
export function SourceCard({ source, compact }: { source: CourseSource; compact?: boolean }) {
  const { t } = useTranslation('courses');
  const credit = t('source.adapted', { book: source.book, authors: source.authors, publisher: source.publisher, license: source.license });
  if (compact)
    return (
      <Text variant="small" color={Colors.textMuted} style={{ fontSize: 12 }}>
        {credit}{' '}
        <Text variant="small" color={Colors.primary} style={{ fontSize: 12 }} onPress={() => Linking.openURL(source.licenseUrl)}>
          {source.license}
        </Text>
      </Text>
    );
  return (
    <Card style={{ gap: Spacing.sm }}>
      <View style={styles.row}>
        <Ionicons name="library" size={18} color={Colors.primary} />
        <Text variant="heading">{t('source.title')}</Text>
      </View>
      <Text color={Colors.textSecondary}>{credit}</Text>
      <View style={styles.row}>
        <Pressable onPress={() => Linking.openURL(source.url)} accessibilityRole="link" hitSlop={8}>
          <Text variant="small" color={Colors.primary}>
            {t('source.original')}
          </Text>
        </Pressable>
        <Text variant="small" color={Colors.textMuted}>
          ·
        </Text>
        <Pressable onPress={() => Linking.openURL(source.licenseUrl)} accessibilityRole="link" hitSlop={8}>
          <Text variant="small" color={Colors.primary}>
            {t('source.license', { license: source.license })}
          </Text>
        </Pressable>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, flexWrap: 'wrap' },
});
