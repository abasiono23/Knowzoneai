import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScenePlayer } from '@/components/videos/scene-player';
import { Text } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useFlipStyle } from '@/i18n/provider';
import { formatViews } from '@/lib/catalog';
import { useSafety } from '@/lib/safety/store';
import { useSession } from '@/lib/session';
import { creatorLabel, subjectLabel } from '@/lib/videos/options';
import { relatedTo, useVideos } from '@/lib/videos/store';
import type { Video } from '@/lib/videos/types';

/** Screen 88: full-screen short-video feed. The visible video plays; the rest wait. */
export default function VideoFeed() {
  const { catalog, generated } = useVideos();
  const { isHidden } = useSafety();
  const { height } = useWindowDimensions();
  const [active, setActive] = useState(0);
  const [focused, setFocused] = useState(true);
  const feed: Video[] = [...catalog, ...generated.filter((g) => g.status === 'ready')].filter(
    (v) => !isHidden('video', v.id),
  );

  useFocusEffect(
    useCallback(() => {
      setFocused(true);
      return () => setFocused(false);
    }, []),
  );

  const onViewable = useCallback(
    ({ viewableItems }: { viewableItems: { index?: number | null; isViewable: boolean }[] }) => {
      const first = viewableItems.find((v) => v.isViewable);
      if (first?.index != null) setActive(first.index);
    },
    [],
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <FlatList
        data={feed}
        keyExtractor={(v) => v.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewable}
        viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
        getItemLayout={(_, i) => ({
          length: height,
          offset: height * i,
          index: i,
        })}
        renderItem={({ item, index }) => (
          <FeedItem
            video={item}
            height={height}
            active={focused && index === active}
            next={feed[index + 1]}
            all={feed}
          />
        )}
      />
      <TopBar />
    </View>
  );
}

function TopBar() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation('videos');
  const flip = useFlipStyle();
  return (
    <View style={[styles.top, { paddingTop: insets.top + Spacing.xs }]} pointerEvents="box-none">
      <Pressable
        onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
        style={styles.round}
        accessibilityRole="button"
        accessibilityLabel={t('actions.goBack', { ns: 'common' })}>
        <Ionicons name="chevron-back" size={22} color="#fff" style={flip} />
      </Pressable>
      <Text variant="heading" color="#fff" style={{ flex: 1 }}>
        {t('feed.title')}
      </Text>
      <Pressable
        onPress={() => router.push('/videos/mine')}
        style={styles.round}
        accessibilityRole="button"
        accessibilityLabel={t('feed.mine')}>
        <Ionicons name="albums" size={20} color="#fff" />
      </Pressable>
      <Pressable
        onPress={() => router.push('/videos/create')}
        style={[styles.round, { backgroundColor: Colors.primary }]}
        accessibilityRole="button"
        accessibilityLabel={t('feed.generate')}>
        <Ionicons name="add" size={24} color="#fff" />
      </Pressable>
    </View>
  );
}

function FeedItem({
  video,
  height,
  active,
  next,
  all,
}: {
  video: Video;
  height: number;
  active: boolean;
  next?: Video;
  all: Video[];
}) {
  const { liked, saved, toggleLike } = useVideos();
  const { user } = useSession();
  const { t } = useTranslation('videos');
  const { t: tHome } = useTranslation('home');
  const insets = useSafeAreaInsets();
  const [ended, setEnded] = useState(false);
  const isLiked = liked.includes(video.id);
  const isSaved = !!saved[video.id];
  const upNext = next ?? relatedTo(video, all, 1)[0];

  const rail: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    count?: string;
    color?: string;
    onPress: () => void;
  }[] = [
    {
      icon: isLiked ? 'heart' : 'heart-outline',
      label: isLiked ? t('feed.unlike') : t('feed.like'),
      count: formatViews(video.likes + (isLiked ? 1 : 0)),
      color: isLiked ? Colors.danger : '#fff',
      onPress: () => toggleLike(video.id),
    },
    {
      icon: isSaved ? 'bookmark' : 'bookmark-outline',
      label: isSaved ? t('feed.saved') : t('feed.save'),
      count: isSaved ? t('feed.saved') : t('feed.save'),
      color: isSaved ? Colors.reward : '#fff',
      onPress: () => router.push(`/videos/${video.id}/save`),
    },
    {
      icon: 'arrow-redo-outline',
      label: t('feed.share'),
      count: t('feed.share'),
      onPress: () => router.push(`/videos/${video.id}/share`),
    },
    {
      icon: 'document-text-outline',
      label: t('feed.transcript'),
      count: t('feed.text'),
      onPress: () => router.push(`/videos/${video.id}/transcript`),
    },
    {
      icon: 'flag-outline',
      label: t('feed.report'),
      count: t('feed.report'),
      onPress: () => router.push(`/videos/${video.id}/report`),
    },
  ];

  return (
    <View style={{ height, backgroundColor: '#000' }}>
      <ScenePlayer video={video} active={active} controls="minimal" onEnded={() => setEnded(true)} />

      <View style={[styles.rail, { bottom: 120 + insets.bottom }]}>
        {rail.map((r) => (
          <Pressable
            key={r.icon}
            onPress={r.onPress}
            accessibilityRole="button"
            accessibilityLabel={r.label}
            style={styles.railBtn}>
            <Ionicons name={r.icon} size={28} color={r.color ?? '#fff'} />
            {r.count && (
              <Text variant="label" color="#fff" style={{ fontSize: 10 }}>
                {r.count}
              </Text>
            )}
          </Pressable>
        ))}
      </View>

      <Pressable
        onPress={() => router.push(`/videos/${video.id}/details`)}
        style={[styles.info, { bottom: 56 + insets.bottom }]}
        accessibilityRole="button"
        accessibilityLabel={t('feed.detailsLabel', { title: video.title })}>
        <View style={styles.creator}>
          <Ionicons
            name={video.origin === 'catalog' ? 'checkmark-circle' : 'person-circle'}
            size={16}
            color={video.origin === 'catalog' ? Colors.success : Colors.reward}
          />
          <Text variant="small" color="#fff" style={{ fontFamily: 'Manrope_700Bold' }}>
            {creatorLabel(video.creator, t)}
          </Text>
          <Text variant="small" color="rgba(255,255,255,0.75)">
            · {subjectLabel(video.subject, t, tHome)}
          </Text>
        </View>
        <Text variant="heading" color="#fff" numberOfLines={2}>
          {video.title}
        </Text>
        <Text variant="small" color="rgba(255,255,255,0.8)" numberOfLines={1}>
          {t('feed.tapForMore')}
        </Text>
      </Pressable>

      {ended && (
        <Animated.View entering={FadeIn} style={[styles.endCard, { bottom: 140 + insets.bottom }]}>
          <Text variant="bodyStrong">{t('feed.finished')}</Text>
          <View style={{ flexDirection: 'row', gap: Spacing.xs }}>
            {user?.role !== 'teacher' && (
              <Pressable onPress={() => router.push('/tutor')} style={styles.endBtn} accessibilityRole="button">
                <Ionicons name="chatbubbles" size={16} color="#fff" />
                <Text variant="small">{t('feed.askAi')}</Text>
              </Pressable>
            )}
            <Pressable
              onPress={() => router.push(`/videos/${video.id}/summary`)}
              style={styles.endBtn}
              accessibilityRole="button">
              <Ionicons name="document-text" size={16} color="#fff" />
              <Text variant="small">{t('feed.summary')}</Text>
            </Pressable>
          </View>
          {upNext && (
            <Text variant="small" color={Colors.textSecondary}>
              {t('feed.upNext', { title: upNext.title })}
            </Text>
          )}
        </Animated.View>
      )}
    </View>
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
  },
  round: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rail: {
    position: 'absolute',
    right: Spacing.sm,
    gap: Spacing.md,
    alignItems: 'center',
  },
  railBtn: { alignItems: 'center', gap: 2, width: 56 },
  info: { position: 'absolute', left: Spacing.md, right: 80, gap: 4 },
  creator: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  endCard: {
    position: 'absolute',
    left: Spacing.md,
    right: 80,
    gap: Spacing.xs,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    backgroundColor: 'rgba(11,16,38,0.92)',
    borderWidth: 1,
    borderColor: Colors.borderStrong,
  },
  endBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: Radius.pill,
    backgroundColor: Colors.primary,
  },
});
