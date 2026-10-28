import { LinearGradient } from '@/components/ui/gradient';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet } from 'react-native';

import { Text } from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { lessonsFor, subjectName, type Subject } from '@/lib/catalog';

export function SubjectTile({ subject, width = '48%' }: { subject: Subject; width?: number | `${number}%` }) {
  const { t } = useTranslation('home');
  const name = subjectName(subject, t);
  const lessons = lessonsFor(subject.id).length;
  return (
    <Pressable
      onPress={() => router.push(`/subjects/${subject.id}`)}
      accessibilityRole="button"
      accessibilityLabel={name}
      style={({ pressed }) => [
        { width, flexGrow: typeof width === 'string' ? 1 : 0 },
        { transform: [{ scale: pressed ? 0.97 : 1 }] },
      ]}>
      <LinearGradient colors={subject.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.tile}>
        <Text style={styles.emoji}>{subject.emoji}</Text>
        <Text variant="bodyStrong" numberOfLines={2}>
          {name}
        </Text>
        <Text variant="small" color="rgba(255,255,255,0.85)" style={{ fontSize: 12 }}>
          {t('subjectTile.meta', {
            lessons:
              lessons === 0 ? t('status.comingSoon', { ns: 'common' }) : t('subject.lessons', { count: lessons }),
            topics: t('subjectTile.topics', { count: subject.topics.length }),
          })}
        </Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: { borderRadius: Radius.lg, padding: Spacing.md, gap: 4, minHeight: 120, justifyContent: 'flex-end' },
  emoji: { position: 'absolute', top: Spacing.sm, right: Spacing.sm, fontSize: 30, lineHeight: 36 },
});
