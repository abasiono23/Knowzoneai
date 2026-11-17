import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, View } from 'react-native';

import { KoraLessonCard } from '@/components/kora/lesson-card';
import { Card, Screen, ScreenHeader, SectionHeader, Text } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { useKoraLessons, useWatchedLessons, type KoraLessonCard as Lesson } from '@/lib/kora/lessons';
import { examNames, listOf, regionOf } from '@/lib/region';
import { useSession } from '@/lib/session';

const GROUPS: Lesson['group'][] = ['exam', 'cyber', 'skills'];

/**
 * Lessons with Kora: three-minute lessons taught by Kora, for the student's region. Lessons for the
 * exams their country sits come first, then cybersecurity and study skills, which are for everyone.
 */
export default function KoraLessonsScreen() {
  const [attempt, setAttempt] = useState(0);
  return <Lessons key={attempt} onRetry={() => setAttempt((n) => n + 1)} />;
}

function Lessons({ onRetry }: { onRetry: () => void }) {
  const { t } = useTranslation('videos');
  const { user } = useSession();
  const region = regionOf(user);
  const lessons = useKoraLessons(region);
  const watched = useWatchedLessons();
  const exams = listOf(examNames(region));
  return (
    <Screen withTabBar={false}>
      <ScreenHeader title={t('kora.title')} />
      <Text color={Colors.textSecondary} style={{ marginTop: -Spacing.sm }}>
        {t('kora.subtitle')}
      </Text>
      {!lessons ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: Spacing.xl }} />
      ) : !lessons.length ? (
        <Card style={{ gap: Spacing.sm, alignItems: 'center' }}>
          <Ionicons name="cloud-offline-outline" size={28} color={Colors.textMuted} />
          <Text center color={Colors.textSecondary}>
            {t('kora.listFailed')}
          </Text>
          <Pressable onPress={onRetry} accessibilityRole="button" hitSlop={8}>
            <Text color={Colors.primary} variant="bodyStrong">
              {t('watch.retry')}
            </Text>
          </Pressable>
        </Card>
      ) : (
        GROUPS.map((group) => {
          const items = lessons.filter((l) => l.group === group);
          if (!items.length) return null;
          return (
            <View key={group} style={{ gap: Spacing.sm }}>
              <SectionHeader title={group === 'exam' ? t('kora.groups.exam', { exams }) : t(`kora.groups.${group}`)} />
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm }}>
                {items.map((l) => (
                  <KoraLessonCard key={l.id} lesson={l} watched={watched.has(l.id)} style={{ flexBasis: 200, flexGrow: 1, maxWidth: 352 }} />
                ))}
              </View>
            </View>
          );
        })
      )}
    </Screen>
  );
}
