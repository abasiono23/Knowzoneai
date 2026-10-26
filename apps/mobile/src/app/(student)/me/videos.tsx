import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/content/empty-state';
import { VideoThumb } from '@/components/videos/video-thumb';
import { Button, Card, Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { formatDate } from '@/i18n';
import { useVideos } from '@/lib/videos/store';
import { clock, durationOf } from '@/lib/videos/types';

/** Screen 184: my generated videos. */
export default function MyVideosProfileScreen() {
  const { generated, progress } = useVideos();
  const { t } = useTranslation('settings');
  const ready = generated.filter((v) => v.status === 'ready');
  const other = generated.filter((v) => v.status !== 'ready');
  const seconds = ready.reduce((n, v) => n + durationOf(v.scenes), 0);

  return (
    <Screen withTabBar={false}>
      <ScreenHeader eyebrow={t('me.eyebrow')} title={t('myVideos.title')} />
      {generated.length > 0 && (
        <View style={styles.stats}>
          <Card style={styles.stat}>
            <Text variant="title">{ready.length}</Text>
            <Text variant="small" color={Colors.textMuted} style={{ fontSize: 12 }}>
              {t('myVideos.made', { count: ready.length })}
            </Text>
          </Card>
          <Card style={styles.stat}>
            <Text variant="title">{clock(seconds)}</Text>
            <Text variant="small" color={Colors.textMuted} style={{ fontSize: 12 }}>
              {t('myVideos.ofExplainers')}
            </Text>
          </Card>
          <Card style={styles.stat}>
            <Text variant="title">{ready.filter((v) => (progress[v.id] ?? 0) > 0).length}</Text>
            <Text variant="small" color={Colors.textMuted} style={{ fontSize: 12 }}>
              {t('myVideos.watched')}
            </Text>
          </Card>
        </View>
      )}
      {generated.length === 0 ? (
        <EmptyState
          icon="videocam-outline"
          title={t('myVideos.emptyTitle')}
          body={t('myVideos.emptyBody')}
          action={{ label: t('myVideos.make'), onPress: () => router.push('/videos/create') }}
        />
      ) : (
        <>
          {other.length > 0 && (
            <Card style={styles.pending}>
              <Ionicons name="hourglass-outline" size={18} color={Colors.reward} />
              <Text variant="small" style={{ flex: 1 }}>
                {t('myVideos.pending', { count: other.length })}
              </Text>
              <Button variant="ghost" title={t('myVideos.view')} onPress={() => router.push('/videos/mine')} />
            </Card>
          )}
          <View style={styles.grid}>
            {ready.map((v) => (
              <Pressable
                key={v.id}
                onPress={() => router.push(`/videos/mine/${v.id}` as Href)}
                accessibilityRole="button"
                accessibilityLabel={v.title}
                style={styles.cell}>
                <VideoThumb
                  video={v}
                  height={200}
                  progress={(progress[v.id] ?? 0) / Math.max(1, durationOf(v.scenes))}
                />
                <Text variant="small" numberOfLines={2} style={{ fontFamily: 'Manrope_600SemiBold' }}>
                  {v.title}
                </Text>
                <Text variant="small" color={Colors.textMuted} style={{ fontSize: 11 }}>
                  {t('myVideos.meta', {
                    subject: v.subject,
                    date: formatDate(v.createdAt, { day: 'numeric', month: 'short' }),
                  })}
                </Text>
              </Pressable>
            ))}
          </View>
          <Button
            variant="secondary"
            icon="sparkles"
            title={t('myVideos.makeAnother')}
            onPress={() => router.push('/videos/create')}
          />
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  stats: { flexDirection: 'row', gap: Spacing.xs },
  stat: { flex: 1, alignItems: 'center', gap: 2, padding: Spacing.sm },
  pending: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  cell: { width: '47%', flexGrow: 1, gap: 4 },
});
