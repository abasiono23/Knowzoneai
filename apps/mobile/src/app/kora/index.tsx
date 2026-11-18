import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, View } from 'react-native';

import { KoraLessonCard } from '@/components/kora/lesson-card';
import { Card, Screen, ScreenHeader, SectionHeader, Text } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { useKoraLessons, useWatchedLessons, type KoraLessonCard as Lesson } from '@/lib/kora/lessons';
import { examNames, listOf, regionOf } from '@/lib/region';
import { useSession } from '@/lib/session';
import { skillsApi } from '@/lib/skills';

/**
 * Lessons with Kora: three-minute lessons taught by Kora, for the student's region. Lessons for the
 * exams their country sits come first; then Future skills (coding, UI/UX design, cybersecurity, AI
 * prompting, data science), subject by subject; then study skills. The last two are for everyone.
 */
export default function KoraLessonsScreen() {
  const [attempt, setAttempt] = useState(0);
  return <Lessons key={attempt} onRetry={() => setAttempt((n) => n + 1)} />;
}

function Lessons({ onRetry }: { onRetry: () => void }) {
  const { t } = useTranslation('videos');
  const { t: th } = useTranslation('home');
  const { user } = useSession();
  const region = regionOf(user);
  const lessons = useKoraLessons(region);
  const watched = useWatchedLessons();
  const exams = listOf(examNames(region));
  // The subjects' names in the app's language come from the server; until they arrive (or without them) a lesson's own subject is used.
  const [skillNames, setSkillNames] = useState<Record<string, string>>({});
  useEffect(() => {
    let live = true;
    skillsApi
      .list()
      .then((r) => live && setSkillNames(Object.fromEntries(r.skills.map((s) => [s.id, s.name]))))
      .catch(() => {});
    return () => {
      live = false;
    };
  }, []);

  const grid = (items: Lesson[]) => (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm }}>
      {items.map((l) => (
        <KoraLessonCard key={l.id} lesson={l} watched={watched.has(l.id)} style={{ flexBasis: 200, flexGrow: 1, maxWidth: 352 }} />
      ))}
    </View>
  );
  const all = lessons ?? [];
  const forExams = all.filter((l) => l.group === 'exam');
  const future = all.filter((l) => !!l.skill);
  const skills = [...new Set(future.map((l) => l.skill!))];
  const study = all.filter((l) => l.group !== 'exam' && !l.skill);
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
        <>
          {forExams.length > 0 && (
            <View style={{ gap: Spacing.sm }}>
              <SectionHeader title={t('kora.groups.exam', { exams })} />
              {grid(forExams)}
            </View>
          )}
          {future.length > 0 && (
            <View style={{ gap: Spacing.sm }}>
              <SectionHeader title={th('explore.collections.future.title')} />
              {skills.map((skill) => {
                const items = future.filter((l) => l.skill === skill);
                return (
                  <View key={skill} style={{ gap: Spacing.xs }}>
                    <Text variant="label" color={Colors.textSecondary}>
                      {(skillNames[skill] ?? items[0].subject).toUpperCase()}
                    </Text>
                    {grid(items)}
                  </View>
                );
              })}
            </View>
          )}
          {study.length > 0 && (
            <View style={{ gap: Spacing.sm }}>
              <SectionHeader title={t('kora.groups.skills')} />
              {grid(study)}
            </View>
          )}
        </>
      )}
    </Screen>
  );
}
