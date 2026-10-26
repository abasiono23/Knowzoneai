import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GeneratedRoute } from '@/components/videos/generated-route';
import { ScenePlayer } from '@/components/videos/scene-player';
import { Button, Text } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { subjectLabel } from '@/lib/videos/options';
import { clock, durationOf } from '@/lib/videos/types';

/** Screen 105: watch the freshly generated video, then keep it, adjust it or regenerate it. */
export default function PreviewScreen() {
  const { t } = useTranslation('videos');
  const { t: tHome } = useTranslation('home');
  return (
    <GeneratedRoute>
      {(v) => (
        <View style={{ flex: 1, backgroundColor: Colors.backgroundDeep }}>
          <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.head}>
              <Text variant="label" color={Colors.success}>
                {t('preview.eyebrow', { revision: v.revision })}
              </Text>
              <Text variant="title" numberOfLines={2}>
                {v.title}
              </Text>
              <Text variant="small" color={Colors.textSecondary}>
                {clock(durationOf(v.scenes))} · {t('units.scenes', { count: v.scenes.length })} ·{' '}
                {subjectLabel(v.subject, t, tHome)}
              </Text>
            </View>
            <View style={styles.player}>
              <ScenePlayer video={v} />
            </View>
            <View style={styles.actions}>
              <Button
                title={t('preview.keep')}
                icon="checkmark"
                onPress={() => router.replace(`/videos/mine/${v.id}`)}
              />
              <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
                <Button
                  variant="secondary"
                  title={t('preview.adjust')}
                  icon="options"
                  style={{ flex: 1 }}
                  onPress={() => router.push(`/videos/mine/${v.id}/adjust`)}
                />
                <Button
                  variant="secondary"
                  title={t('preview.regenerate')}
                  icon="refresh"
                  style={{ flex: 1 }}
                  onPress={() =>
                    router.push({
                      pathname: '/videos/mine/[id]/adjust',
                      params: { id: v.id, mode: 'regenerate' },
                    })
                  }
                />
              </View>
            </View>
          </SafeAreaView>
        </View>
      )}
    </GeneratedRoute>
  );
}

const styles = StyleSheet.create({
  head: { paddingHorizontal: Spacing.md, paddingTop: Spacing.sm, gap: 2 },
  player: {
    flex: 1,
    margin: Spacing.md,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  actions: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
});
