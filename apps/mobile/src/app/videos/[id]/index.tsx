import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScenePlayer } from '@/components/videos/scene-player';
import { VideoRoute } from '@/components/videos/video-route';
import { Text } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useVideos } from '@/lib/videos/store';

/** Screen 89: full-screen video player with scrubbing, speed, captions and narration controls. */
export default function PlayerScreen() {
  const { t: start } = useLocalSearchParams<{ t?: string }>();
  const { setProgress, progress } = useVideos();
  const { t } = useTranslation('videos');
  return (
    <VideoRoute>
      {(v) => (
        <View style={{ flex: 1, backgroundColor: '#000' }}>
          <ScenePlayer
            video={v}
            startAt={start ? Number(start) : (progress[v.id] ?? 0)}
            onTime={(s) => setProgress(v.id, s)}
          />
          <SafeAreaView edges={['top']} style={styles.top} pointerEvents="box-none">
            <Pressable
              onPress={() => router.back()}
              style={styles.round}
              accessibilityRole="button"
              accessibilityLabel={t('player.close')}>
              <Ionicons name="chevron-down" size={24} color="#fff" />
            </Pressable>
            <Text variant="bodyStrong" color="#fff" numberOfLines={1} style={{ flex: 1 }}>
              {v.title}
            </Text>
            <Pressable
              onPress={() => router.push(`/videos/${v.id}/details`)}
              style={styles.round}
              accessibilityRole="button"
              accessibilityLabel={t('player.details')}>
              <Ionicons name="information-circle-outline" size={22} color="#fff" />
            </Pressable>
          </SafeAreaView>
        </View>
      )}
    </VideoRoute>
  );
}

const styles = StyleSheet.create({
  top: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xs,
  },
  round: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
