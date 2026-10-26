import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { GeneratedRoute } from '@/components/videos/generated-route';
import { VideoThumb } from '@/components/videos/video-thumb';
import { ActionSheet, Button, Card, IconButton, Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { formatDate } from '@/i18n';
import {
  captionStyleLabel,
  lengthLabel,
  sourceLabel,
  styleName,
  subjectLabel,
  VIDEO_LANGUAGES,
  voiceName,
} from '@/lib/videos/options';
import { useVideos } from '@/lib/videos/store';
import { clock, durationOf } from '@/lib/videos/types';

/** Screen 108: a generated video's detail page. */
export default function GeneratedDetailScreen() {
  const { removeGenerated } = useVideos();
  const [menu, setMenu] = useState(false);
  const { t } = useTranslation('videos');
  const { t: tHome } = useTranslation('home');

  return (
    <GeneratedRoute>
      {(v) => {
        const rows: [keyof typeof Ionicons.glyphMap, string, string][] = [
          ['document-attach', t('video.source'), sourceLabel(v.source, t)],
          [
            'timer',
            t('video.length'),
            t('video.lengthValue', {
              target: lengthLabel(v.settings.length, t),
              actual: clock(durationOf(v.scenes)),
            }),
          ],
          ['mic', t('video.narration'), voiceName(v.settings.voiceId, t)],
          ['color-palette', t('video.style'), styleName(v.settings.styleId, t)],
          [
            'chatbox-ellipses',
            t('video.captions'),
            v.settings.captions ? captionStyleLabel(v.settings.captionStyle, t) : t('video.off'),
          ],
          [
            'language',
            t('video.language'),
            VIDEO_LANGUAGES.find((l) => l.id === v.settings.language)?.label ?? 'English',
          ],
        ];
        return (
          <Screen withTabBar={false}>
            <ScreenHeader
              eyebrow={t('video.eyebrow', { revision: v.revision })}
              right={<IconButton icon="ellipsis-horizontal" label={t('video.more')} onPress={() => setMenu(true)} />}
            />
            <Pressable
              onPress={() => router.push(`/videos/${v.id}`)}
              accessibilityRole="button"
              accessibilityLabel={t('video.play', { title: v.title })}>
              <VideoThumb video={v} height={260} />
              <View style={styles.play}>
                <Ionicons name="play" size={24} color="#fff" style={{ marginLeft: 3 }} />
              </View>
            </Pressable>
            <View style={{ gap: 4 }}>
              <Text variant="title">{v.title}</Text>
              <Text variant="small" color={Colors.textSecondary}>
                {subjectLabel(v.subject, t, tHome)} · {t('units.scenes', { count: v.scenes.length })} ·{' '}
                {t('video.made', { date: formatDate(v.createdAt, {}) })}
              </Text>
            </View>
            {!!v.description && <Text color={Colors.textSecondary}>{v.description}</Text>}
            <Card style={{ gap: Spacing.sm }}>
              {rows.map(([icon, label, value]) => (
                <View key={label} style={styles.row}>
                  <Ionicons name={icon} size={16} color={Colors.textMuted} />
                  <Text variant="small" color={Colors.textSecondary} style={{ width: 84 }}>
                    {label}
                  </Text>
                  <Text variant="small" style={{ flex: 1 }}>
                    {value}
                  </Text>
                </View>
              ))}
            </Card>
            <Button title={t('video.playButton')} icon="play" onPress={() => router.push(`/videos/${v.id}`)} />
            <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
              <Button
                variant="secondary"
                title={t('video.adjust')}
                icon="options"
                style={{ flex: 1 }}
                onPress={() => router.push(`/videos/mine/${v.id}/adjust`)}
              />
              <Button
                variant="secondary"
                title={t('video.share')}
                icon="arrow-redo"
                style={{ flex: 1 }}
                onPress={() => router.push(`/videos/${v.id}/share`)}
              />
            </View>
            <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
              <Button
                variant="ghost"
                title={t('video.transcript')}
                icon="document-text"
                style={{ flex: 1 }}
                onPress={() => router.push(`/videos/${v.id}/transcript`)}
              />
              <Button
                variant="ghost"
                title={t('video.moments')}
                icon="list"
                style={{ flex: 1 }}
                onPress={() => router.push(`/videos/${v.id}/moments`)}
              />
            </View>
            <ActionSheet
              visible={menu}
              title={v.title}
              onClose={() => setMenu(false)}
              options={[
                {
                  label: t('video.regenerate'),
                  icon: 'refresh',
                  onPress: () =>
                    router.push({
                      pathname: '/videos/mine/[id]/adjust',
                      params: { id: v.id, mode: 'regenerate' },
                    }),
                },
                {
                  label: t('video.summary'),
                  icon: 'sparkles',
                  onPress: () => router.push(`/videos/${v.id}/summary`),
                },
                {
                  label: t('video.delete'),
                  icon: 'trash',
                  destructive: true,
                  onPress: () => {
                    removeGenerated(v.id);
                    router.replace('/videos/mine');
                  },
                },
              ]}
            />
          </Screen>
        );
      }}
    </GeneratedRoute>
  );
}

const styles = StyleSheet.create({
  play: {
    position: 'absolute',
    left: Spacing.sm,
    bottom: Spacing.sm,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: { flexDirection: 'row', gap: Spacing.xs, alignItems: 'flex-start' },
});
