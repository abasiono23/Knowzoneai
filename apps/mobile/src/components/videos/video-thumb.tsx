import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { ProgressBar, Text } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { formatViews } from '@/lib/catalog';
import { creatorLabel, styleOf, subjectLabel } from '@/lib/videos/options';
import { clock, durationOf, type Video } from '@/lib/videos/types';

import { SceneView } from './scene-view';

/** A video's first scene as a still thumbnail, with its duration. */
export function VideoThumb({ video, height = 200, progress }: { video: Video; height?: number; progress?: number }) {
  const first = video.scenes[0];
  const total = durationOf(video.scenes);
  return (
    <View style={[styles.thumb, { height }]}>
      {first ? (
        <SceneView scene={first} style={styleOf(video.settings.styleId)} scale={height < 200 ? 0.44 : 0.62} />
      ) : (
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: Colors.surfaceRaised,
              alignItems: 'center',
              justifyContent: 'center',
            },
          ]}>
          <Ionicons name="film" size={32} color={Colors.textMuted} />
        </View>
      )}
      {total > 0 && (
        <View style={styles.duration}>
          <Text variant="label" style={{ fontSize: 10 }}>
            {clock(total)}
          </Text>
        </View>
      )}
      {progress !== undefined && progress > 0 && (
        <View style={styles.progress}>
          <ProgressBar progress={progress} height={3} />
        </View>
      )}
    </View>
  );
}

/** Row used in Related videos and libraries. */
export function VideoRow({ video, onPress, meta }: { video: Video; onPress?: () => void; meta?: string }) {
  const { t } = useTranslation('videos');
  const { t: tHome } = useTranslation('home');
  return (
    <Pressable
      onPress={onPress ?? (() => router.push(`/videos/${video.id}`))}
      accessibilityRole="button"
      accessibilityLabel={video.title}
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.8 }]}>
      <View style={{ width: 112 }}>
        <VideoThumb video={video} height={150} />
      </View>
      <View style={{ flex: 1, gap: 4 }}>
        <Text variant="bodyStrong" numberOfLines={2}>
          {video.title}
        </Text>
        <Text variant="small" color={Colors.textSecondary} style={{ fontSize: 12 }}>
          {meta ?? `${subjectLabel(video.subject, t, tHome)} · ${creatorLabel(video.creator, t)}`}
        </Text>
        <Text variant="small" color={Colors.textMuted} style={{ fontSize: 12 }}>
          {t('units.views', { count: video.views, views: formatViews(video.views) })} ·{' '}
          {t('units.scenes', { count: video.scenes.length })}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  thumb: {
    borderRadius: Radius.md,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
  },
  duration: {
    position: 'absolute',
    right: 6,
    bottom: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: Radius.pill,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  progress: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  row: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'flex-start' },
});
