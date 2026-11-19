import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { formatDate } from '@/i18n';
import { useVideos } from '@/lib/videos/store';
import { durationOf, type GeneratedVideo } from '@/lib/videos/types';

import { VideoThumb } from './video-thumb';

const CARD_W = 150;

/**
 * The video summaries a student has made from their textbooks, newest first, so they can watch them again.
 * They're kept on the account (My videos); this puts them where the student made them: on the book's page
 * (`textbookId`) and in the tutor's history (every book). Nothing shows until there's at least one.
 */
export function VideoSummaryRail({ textbookId, limit = 12 }: { textbookId?: string; limit?: number }) {
  const { t } = useTranslation('tutor');
  const { generated, progress } = useVideos();
  const list = generated
    .filter((v) => v.source?.kind === 'textbook' && (!textbookId || v.source.textbookId === textbookId))
    .sort((a, b) => b.createdAt - a.createdAt);
  if (!list.length) return null;
  const shown = list.slice(0, limit);

  return (
    <View style={{ gap: Spacing.xs }}>
      <View style={styles.head}>
        <Text variant="label" color={Colors.textMuted} style={{ flex: 1 }}>
          {(textbookId ? t('videoSummaries.fromBook') : t('videoSummaries.title')).toLocaleUpperCase()}
        </Text>
        <Pressable onPress={() => router.push('/me/videos')} accessibilityRole="link" hitSlop={8}>
          <Text variant="small" color={Colors.primary} style={{ fontFamily: 'Manrope_600SemiBold' }}>
            {t('videoSummaries.seeAll')}
          </Text>
        </Pressable>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: Spacing.sm }}>
        {shown.map((v) => (
          <SummaryCard key={v.id} v={v} watched={(progress[v.id] ?? 0) / Math.max(1, durationOf(v.scenes))} />
        ))}
      </ScrollView>
    </View>
  );
}

function SummaryCard({ v, watched }: { v: GeneratedVideo; watched: number }) {
  const { t } = useTranslation('tutor');
  const topic = v.source?.kind === 'textbook' ? v.source.topic : v.title;
  const book = v.source?.kind === 'textbook' ? v.source.label : v.subject;
  const open = () =>
    router.push((v.status === 'ready' ? `/videos/mine/${v.id}/preview` : `/videos/generate/${v.id}`) as Href);
  return (
    <Pressable
      onPress={open}
      accessibilityRole="button"
      accessibilityLabel={t('videoSummaries.open', { topic })}
      style={({ pressed }) => [{ width: CARD_W, gap: 4 }, pressed && { opacity: 0.8 }]}>
      {v.status === 'ready' && v.scenes.length ? (
        <VideoThumb video={v} height={110} progress={watched} />
      ) : (
        <View style={styles.waiting}>
          {v.status === 'generating' ? (
            <ActivityIndicator color={Colors.primary} />
          ) : (
            <Ionicons name="alert-circle-outline" size={26} color={Colors.textMuted} />
          )}
          <Text variant="small" color={Colors.textMuted} center style={{ fontSize: 11 }}>
            {v.status === 'generating' ? t('videoSummaries.making') : t('videoSummaries.failed')}
          </Text>
        </View>
      )}
      <Text variant="small" numberOfLines={2} style={{ fontFamily: 'Manrope_600SemiBold' }}>
        {topic}
      </Text>
      <Text variant="small" color={Colors.textMuted} numberOfLines={1} style={{ fontSize: 11 }}>
        {book} · {formatDate(v.createdAt, { day: 'numeric', month: 'short' })}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  waiting: {
    height: 110,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: Spacing.xs,
  },
});
