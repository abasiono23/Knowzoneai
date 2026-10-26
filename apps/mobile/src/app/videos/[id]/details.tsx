import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { VideoRow, VideoThumb } from '@/components/videos/video-thumb';
import { VideoRoute } from '@/components/videos/video-route';
import { Button, Card, Screen, ScreenHeader, SectionHeader, Text } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useFlipStyle } from '@/i18n/provider';
import { formatViews } from '@/lib/catalog';
import { useSession } from '@/lib/session';
import { creatorLabel, levelText, sourceLabel, styleName, subjectLabel, voiceName } from '@/lib/videos/options';
import { relatedTo, useVideos } from '@/lib/videos/store';
import { clock, durationOf } from '@/lib/videos/types';

/** Screen 90: everything about a video, with links to transcript, summary, moments and related. */
export default function VideoDetailsScreen() {
  const { liked, saved, toggleLike, catalog, generated, progress } = useVideos();
  const { user } = useSession();
  const { t } = useTranslation('videos');
  const { t: tHome } = useTranslation('home');
  const flip = useFlipStyle();
  return (
    <VideoRoute>
      {(v) => {
        const total = durationOf(v.scenes);
        const all = [...catalog, ...generated.filter((g) => g.status === 'ready')];
        const related = relatedTo(v, all, 3);
        const links: {
          href: string;
          icon: keyof typeof Ionicons.glyphMap;
          label: string;
          meta: string;
        }[] = [
          {
            href: `/videos/${v.id}/summary`,
            icon: 'sparkles',
            label: t('details.summary'),
            meta: t('details.summaryMeta'),
          },
          {
            href: `/videos/${v.id}/moments`,
            icon: 'list',
            label: t('details.moments'),
            meta: t('details.chapters', { count: v.scenes.length }),
          },
          {
            href: `/videos/${v.id}/transcript`,
            icon: 'document-text',
            label: t('details.transcript'),
            meta: t('details.transcriptMeta'),
          },
        ];
        return (
          <Screen withTabBar={false}>
            <ScreenHeader eyebrow={subjectLabel(v.subject, t, tHome).toUpperCase()} />
            <Pressable
              onPress={() => router.push(`/videos/${v.id}`)}
              accessibilityRole="button"
              accessibilityLabel={t('details.play', { title: v.title })}>
              <VideoThumb video={v} height={220} progress={(progress[v.id] ?? 0) / total} />
              <View style={styles.play}>
                <Ionicons name="play" size={24} color="#fff" style={{ marginLeft: 3 }} />
              </View>
            </Pressable>
            <View style={{ gap: 4 }}>
              <Text variant="title">{v.title}</Text>
              <Text variant="small" color={Colors.textSecondary}>
                {t('details.meta', {
                  count: v.views,
                  creator: creatorLabel(v.creator, t),
                  views: formatViews(v.views),
                  duration: clock(total),
                  level: levelText(v.level, t, tHome),
                })}
              </Text>
            </View>
            <View style={styles.actions}>
              <Action
                icon={liked.includes(v.id) ? 'heart' : 'heart-outline'}
                label={liked.includes(v.id) ? t('details.liked') : t('details.like')}
                color={liked.includes(v.id) ? Colors.danger : undefined}
                onPress={() => toggleLike(v.id)}
              />
              <Action
                icon={saved[v.id] ? 'bookmark' : 'bookmark-outline'}
                label={saved[v.id] ? t('details.saved') : t('details.save')}
                color={saved[v.id] ? Colors.reward : undefined}
                onPress={() => router.push(`/videos/${v.id}/save`)}
              />
              <Action
                icon="arrow-redo-outline"
                label={t('details.share')}
                onPress={() => router.push(`/videos/${v.id}/share`)}
              />
              <Action
                icon="flag-outline"
                label={t('details.report')}
                onPress={() => router.push(`/videos/${v.id}/report`)}
              />
            </View>
            <Text color={Colors.textSecondary}>{v.description}</Text>
            <Card style={{ gap: Spacing.xs }}>
              <Row icon="mic" label={t('details.narration')} value={voiceName(v.settings.voiceId, t)} />
              <Row icon="color-palette" label={t('details.visualStyle')} value={styleName(v.settings.styleId, t)} />
              <Row
                icon="chatbox-ellipses"
                label={t('details.captions')}
                value={v.settings.captions ? t('details.captionsOn') : t('details.captionsOff')}
              />
              <Row
                icon="link"
                label={t('details.source')}
                value={
                  v.origin === 'catalog'
                    ? t('details.originals')
                    : v.source
                      ? sourceLabel(v.source, t)
                      : t('labels.yourMaterial')
                }
              />
            </Card>
            {links.map((l) => (
              <Pressable
                key={l.label}
                onPress={() => router.push(l.href as Href)}
                accessibilityRole="button"
                accessibilityLabel={l.label}>
                <Card style={styles.link}>
                  <Ionicons name={l.icon} size={20} color={Colors.primary} />
                  <View style={{ flex: 1 }}>
                    <Text variant="bodyStrong">{l.label}</Text>
                    <Text variant="small" color={Colors.textSecondary}>
                      {l.meta}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} style={flip} />
                </Card>
              </Pressable>
            ))}
            {v.lessonId && user?.role !== 'teacher' && (
              <Button
                variant="secondary"
                icon="book"
                title={t('details.openLesson')}
                onPress={() => router.push(`/lesson/${v.lessonId}` as Href)}
              />
            )}
            {related.length > 0 && (
              <View style={{ gap: Spacing.sm }}>
                <SectionHeader
                  title={t('details.related')}
                  action={t('actions.seeAll', { ns: 'common' })}
                  onAction={() => router.push(`/videos/${v.id}/related`)}
                />
                {related.map((r) => (
                  <VideoRow key={r.id} video={r} />
                ))}
              </View>
            )}
          </Screen>
        );
      }}
    </VideoRoute>
  );
}

function Action({
  icon,
  label,
  color,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color?: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} style={styles.action}>
      <Ionicons name={icon} size={22} color={color ?? Colors.text} />
      <Text variant="small" style={{ fontSize: 12 }}>
        {label}
      </Text>
    </Pressable>
  );
}

function Row({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Ionicons name={icon} size={16} color={Colors.textMuted} />
      <Text variant="small" color={Colors.textSecondary} style={{ width: 92 }}>
        {label}
      </Text>
      <Text variant="small" style={{ flex: 1 }}>
        {value}
      </Text>
    </View>
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
  actions: { flexDirection: 'row', justifyContent: 'space-around' },
  action: {
    alignItems: 'center',
    gap: 4,
    padding: Spacing.xs,
    borderRadius: Radius.md,
    minWidth: 64,
  },
  row: { flexDirection: 'row', gap: Spacing.xs, alignItems: 'flex-start' },
  link: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
});
