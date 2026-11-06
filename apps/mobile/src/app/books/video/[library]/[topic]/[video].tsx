import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, View } from 'react-native';

import { YouTubePlayer } from '@/components/courses/youtube-player';
import { Button, Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { errorText } from '@/i18n/errors';
import { booksApi, type VideoTopicDetail } from '@/lib/books';
import { skillMinutes } from '@/lib/skills';

/** A subject video in YouTube's own player, with the topic's summary and its next video. */
export default function SubjectVideo() {
  const { t } = useTranslation('books');
  const { library, topic, video } = useLocalSearchParams<{ library: string; topic: string; video: string }>();
  const [detail, setDetail] = useState<VideoTopicDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    booksApi
      .videoTopic(library, topic)
      .then((r) => setDetail(r.topic))
      .catch((e) => setError(errorText(e, t('shelf.videosLoadFailed'))));
  }, [library, topic, t]);
  useEffect(load, [load]);

  const at = detail?.videos.findIndex((v) => v.youtubeId === video) ?? -1;
  const current = detail?.videos[at];
  const next = detail?.videos[at + 1];

  return (
    <Screen withTabBar={false}>
      <ScreenHeader eyebrow={detail?.libraryName.toUpperCase()} title={detail?.title} />
      {error ? (
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
      ) : !detail ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: Spacing.lg }} />
      ) : !current ? (
        <Text variant="small" color={Colors.textSecondary} center>
          {t('shelf.videosNone')}
        </Text>
      ) : (
        <>
          <YouTubePlayer key={current.youtubeId} videoId={current.youtubeId} title={current.title} />
          <View style={{ gap: 4 }}>
            <Text variant="heading">{current.title}</Text>
            <Text variant="small" color={Colors.textSecondary}>
              {current.channel} · {t('shelf.videoMinutes', { n: skillMinutes(current.seconds) })}
            </Text>
          </View>
          {next && (
            <Button
              title={t('shelf.videoNext')}
              icon="play"
              onPress={() => router.replace(`/books/video/${library}/${topic}/${next.youtubeId}` as Href)}
            />
          )}
          {detail.hasSummary && (
            <Button
              title={t('shelf.videoSummary')}
              icon="document-text"
              variant="secondary"
              onPress={() => router.push(`/books/summary/${library}/${topic}` as Href)}
            />
          )}
        </>
      )}
    </Screen>
  );
}
