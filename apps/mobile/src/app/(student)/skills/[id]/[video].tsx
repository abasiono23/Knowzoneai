import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, View } from 'react-native';

import { YouTubePlayer } from '@/components/courses/youtube-player';
import { Button, Card, Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { errorText } from '@/i18n/errors';
import { skillMinutes, skillsApi, type Skill } from '@/lib/skills';

/** A Future skills lesson: the video in YouTube's own player, its summary, and the next lesson. */
export default function SkillLesson() {
  const { t } = useTranslation('home');
  const { id, video } = useLocalSearchParams<{ id: string; video: string }>();
  const [skill, setSkill] = useState<Skill | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    skillsApi
      .get(id)
      .then((r) => setSkill(r.skill))
      .catch((e) => setError(errorText(e, t('skills.loadFailed'))));
  }, [id, t]);
  useEffect(load, [load]);

  const at = skill?.videos.findIndex((v) => v.youtubeId === video) ?? -1;
  const lesson = skill?.videos[at];
  const next = skill?.videos[at + 1];

  return (
    <Screen withTabBar={false}>
      <ScreenHeader
        eyebrow={
          skill && lesson ? t('skills.lessonOf', { n: at + 1, total: skill.videos.length }).toUpperCase() : undefined
        }
        title={skill?.name}
      />
      {error ? (
        <View style={{ gap: Spacing.sm, alignItems: 'center' }}>
          <Text variant="small" color={Colors.textSecondary} center>
            {error}
          </Text>
          <Button
            title={t('skills.retry')}
            variant="secondary"
            onPress={() => {
              setError(null);
              load();
            }}
          />
        </View>
      ) : !lesson ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: Spacing.lg }} />
      ) : (
        <>
          <YouTubePlayer key={lesson.youtubeId} videoId={lesson.youtubeId} title={lesson.title} />
          <View style={{ gap: 4 }}>
            <Text variant="heading">{lesson.title}</Text>
            <Text variant="small" color={Colors.textSecondary}>
              {lesson.channel} · {t('skills.minutes', { n: skillMinutes(lesson.seconds) })}
            </Text>
          </View>
          <Card style={{ gap: Spacing.xs }}>
            <Text variant="label" color={Colors.primary}>
              {t('skills.summary').toUpperCase()}
            </Text>
            <Text>{lesson.summary}</Text>
          </Card>
          {next ? (
            <Button
              title={t('skills.nextLesson')}
              icon="play"
              onPress={() => router.replace(`/skills/${id}/${next.youtubeId}` as Href)}
            />
          ) : (
            <Button title={t('skills.allLessons')} icon="list" variant="secondary" onPress={() => router.back()} />
          )}
        </>
      )}
    </Screen>
  );
}
