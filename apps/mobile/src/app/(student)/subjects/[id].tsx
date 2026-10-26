import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/content/empty-state';
import { LessonCard } from '@/components/content/lesson-card';
import { Button, Card, ProgressBar, Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { formatNumber } from '@/i18n';
import { getSubject, lessonsFor, subjectName } from '@/lib/catalog';
import { useLibrary } from '@/lib/library-store';

/** Screen 38: subject hero, mastery, topics and lessons. */
export default function SubjectDetailScreen() {
  const { id, topic: initialTopic } = useLocalSearchParams<{ id: string; topic?: string }>();
  const { progress } = useLibrary();
  const { t } = useTranslation('home');
  const [topic, setTopic] = useState<string | null>(initialTopic ?? null);
  const subject = getSubject(id);

  if (!subject) {
    return (
      <Screen withTabBar={false}>
        <ScreenHeader />
        <EmptyState icon="library" title={t('subject.notFoundTitle')} body={t('subject.notFoundBody')} />
      </Screen>
    );
  }

  const all = lessonsFor(subject.id);
  const lessons = topic ? all.filter((l) => l.topic === topic) : all;
  const mastery = all.length ? all.reduce((sum, l) => sum + (progress[l.id] ?? 0), 0) / all.length : 0;
  const started = all.filter((l) => (progress[l.id] ?? 0) > 0).length;

  return (
    <Screen withTabBar={false}>
      <ScreenHeader eyebrow={t('subject.eyebrow')} />

      <LinearGradient colors={subject.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        <Text style={styles.emoji}>{subject.emoji}</Text>
        <Text variant="display">{subjectName(subject, t)}</Text>
        <Text color="rgba(255,255,255,0.9)">{subject.description}</Text>
        <View style={{ gap: 6, marginTop: Spacing.xs }}>
          <View style={styles.rowBetween}>
            <Text variant="small" color="rgba(255,255,255,0.9)">
              {t('subject.progress', { started, count: all.length })}
            </Text>
            <Text variant="bodyStrong">{formatNumber(mastery, { style: 'percent' })}</Text>
          </View>
          <ProgressBar progress={mastery} colors={['#FFFFFF', '#FFFFFF']} height={8} />
        </View>
      </LinearGradient>

      <View style={styles.actions}>
        <Button
          title={t('subject.quiz')}
          icon="help-circle"
          style={{ flex: 1 }}
          onPress={() => {
            const quiz = all.find((l) => l.format === 'quiz') ?? all[0];
            if (quiz) router.push(`/lesson/${quiz.id}`);
          }}
        />
        <Button
          variant="secondary"
          title={t('subject.studyPack')}
          icon="sparkles"
          style={{ flex: 1 }}
          onPress={() => router.push('/studio')}
        />
      </View>

      <View style={{ gap: Spacing.sm }}>
        <Text variant="heading">{t('subject.topics')}</Text>
        <View style={styles.topics}>
          {subject.topics.map((name) => {
            const count = all.filter((l) => l.topic === name).length;
            const on = topic === name;
            return (
              <Pressable
                key={name}
                onPress={() => setTopic(on ? null : name)}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
                style={[styles.topic, on && styles.topicOn]}>
                <Text variant="small" style={{ fontFamily: 'Manrope_600SemiBold' }}>
                  {name}
                </Text>
                <Text variant="small" color={Colors.textMuted} style={{ fontSize: 12 }}>
                  {count ? t('subject.lessons', { count }) : t('status.comingSoon', { ns: 'common' })}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={{ gap: Spacing.xs }}>
        <Text variant="heading">{topic ? t('subject.topicLessons', { topic }) : t('subject.allLessons')}</Text>
        {lessons.length === 0 ? (
          <Card style={{ flexDirection: 'row', gap: Spacing.sm, alignItems: 'center' }}>
            <Ionicons name="sparkles" size={20} color={Colors.primary} />
            <Text variant="small" color={Colors.textSecondary} style={{ flex: 1 }}>
              {t('subject.noTopicLessons', { topic })}
            </Text>
          </Card>
        ) : (
          lessons.map((l) => <LessonCard key={l.id} lesson={l} progress={progress[l.id]} />)
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { borderRadius: Radius.xl, padding: Spacing.lg, gap: Spacing.xs },
  emoji: { position: 'absolute', top: Spacing.md, right: Spacing.md, fontSize: 48, lineHeight: 56 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  actions: { flexDirection: 'row', gap: Spacing.sm },
  topics: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  topic: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  topicOn: { borderColor: Colors.primary, backgroundColor: Colors.primarySoft },
});
