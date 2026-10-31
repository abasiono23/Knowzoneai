import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useFocusEffect, type Href } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  TextInput,
  useWindowDimensions,
  View,
  type GestureResponderEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { YouTubePlayer } from '@/components/courses/youtube-player';
import { CommentsSheet } from '@/components/reels/comments-sheet';
import { HeartBurst, heartAt, tapTime, type Heart } from '@/components/reels/heart-burst';
import { Text } from '@/components/ui';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { errorText } from '@/i18n/errors';
import { useFlipStyle } from '@/i18n/provider';
import { getSubject, subjectName } from '@/lib/catalog';
import { USE_MOCKS } from '@/lib/config';
import { reelsApi } from '@/lib/reels';
import { useSession } from '@/lib/session';
import { lessonHref, thumbnail, watchApi, type WatchFeed, type WatchVideo } from '@/lib/watch';

type Filter = { q: string; subject?: string };

/**
 * Videos: the courses' YouTube videos as a feed like short videos. Swipe up for the next one; the
 * video you land on starts by itself. Search by topic or pick a subject; like, comment, share, or
 * open the course lesson the video belongs to. More videos load as you scroll.
 */
export default function VideoFeed() {
  const { t } = useTranslation('videos');
  const { height } = useWindowDimensions();
  const [videos, setVideos] = useState<WatchVideo[] | null>(null);
  const [next, setNext] = useState<number | null>(null);
  const [total, setTotal] = useState(0);
  const [subjects, setSubjects] = useState<NonNullable<WatchFeed['subjects']>>([]);
  const [error, setError] = useState<string | null>(USE_MOCKS ? t('watch.offline') : null);
  const [active, setActive] = useState(0);
  const [focused, setFocused] = useState(true);
  const [comments, setComments] = useState<WatchVideo | null>(null);
  const [searching, setSearching] = useState(false);
  const [filter, setFilter] = useState<Filter>({ q: '' });
  const [more, setMore] = useState(false);
  const list = useRef<FlatList<WatchVideo>>(null);

  const load = useCallback(
    (f: Filter) => {
      if (USE_MOCKS) return;
      watchApi
        .feed({ ...f, offset: 0 })
        .then((r) => {
          setVideos(r.videos);
          setNext(r.next);
          setTotal(r.total);
          if (r.subjects) setSubjects(r.subjects);
          setActive(0);
          setError(null);
          list.current?.scrollToOffset({ offset: 0, animated: false });
        })
        .catch((e) => setError(errorText(e, t('watch.loadFailed'))));
    },
    [t],
  );
  useEffect(() => load(filter), [load, filter]);

  // More videos as you get near the end.
  const loading = useRef(false);
  const loadMore = () => {
    if (next === null || loading.current) return;
    loading.current = true;
    setMore(true);
    watchApi
      .feed({ ...filter, offset: next })
      .then((r) => {
        setVideos((v) => [...(v ?? []), ...r.videos.filter((x) => !v?.some((y) => y.id === x.id))]);
        setNext(r.next);
      })
      .catch(() => {})
      .finally(() => {
        loading.current = false;
        setMore(false);
      });
  };

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

  const update = (id: string, patch: Partial<WatchVideo>) =>
    setVideos((v) => v?.map((x) => (x.id === id ? { ...x, ...patch } : x)) ?? null);

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      {videos?.length ? (
        <FlatList
          ref={list}
          data={videos}
          keyExtractor={(v) => v.id}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          onViewableItemsChanged={onViewable}
          viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
          getItemLayout={(_, i) => ({ length: height, offset: height * i, index: i })}
          onEndReached={loadMore}
          onEndReachedThreshold={2}
          windowSize={3}
          renderItem={({ item, index }) => (
            <VideoItem
              video={item}
              height={height}
              active={focused && !comments && !searching && index === active}
              onLike={(liked, likes) => update(item.id, { liked, likes })}
              onComments={() => setComments(item)}
            />
          )}
        />
      ) : (
        <View style={styles.center}>
          {error ? (
            <>
              <Text color="#fff" center>
                {error}
              </Text>
              <Pressable onPress={() => load(filter)} accessibilityRole="button" style={styles.pill}>
                <Text color="#fff">{t('watch.retry')}</Text>
              </Pressable>
            </>
          ) : videos ? (
            <>
              <Ionicons name="search" size={40} color="rgba(255,255,255,0.6)" />
              <Text color="#fff" center>
                {t('watch.empty', { q: filter.q })}
              </Text>
              <Pressable onPress={() => setFilter({ q: '' })} accessibilityRole="button" style={styles.pill}>
                <Text color="#fff">{t('watch.showAll')}</Text>
              </Pressable>
            </>
          ) : (
            <ActivityIndicator color="#fff" size="large" />
          )}
        </View>
      )}
      {more && <ActivityIndicator color="#fff" style={styles.more} />}
      <TopBar searching={searching} onSearch={() => setSearching((s) => !s)} />
      {searching && (
        <SearchPanel
          filter={filter}
          subjects={subjects}
          total={total}
          onSearch={(q) => setFilter((f) => (f.q === q ? f : { ...f, q }))}
          onSubject={(subject) => setFilter((f) => ({ ...f, subject: f.subject === subject ? undefined : subject }))}
          onDone={() => setSearching(false)}
        />
      )}
      <CommentsSheet
        reel={comments}
        onClose={() => setComments(null)}
        onCount={(id, n) => update(id, { comments: n })}
      />
    </View>
  );
}

function TopBar({ searching, onSearch }: { searching: boolean; onSearch: () => void }) {
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
      <Text style={{ flex: 1, fontFamily: Fonts.extrabold, fontSize: 18 }} color="#fff">
        {t('watch.title')}
      </Text>
      <Pressable
        onPress={onSearch}
        style={[styles.round, searching && { backgroundColor: Colors.primary }]}
        accessibilityRole="button"
        accessibilityLabel={t('watch.search')}>
        <Ionicons name={searching ? 'close' : 'search'} size={20} color="#fff" />
      </Pressable>
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

/** Search: a plain text field (no autofocus) and subject chips. */
function SearchPanel({
  filter,
  subjects,
  total,
  onSearch,
  onSubject,
  onDone,
}: {
  filter: Filter;
  subjects: NonNullable<WatchFeed['subjects']>;
  total: number;
  onSearch: (q: string) => void;
  onSubject: (id: string) => void;
  onDone: () => void;
}) {
  const { t } = useTranslation('videos');
  const { t: th } = useTranslation('home');
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState(filter.q);
  return (
    <View style={[styles.panel, { top: insets.top + 56 }]}>
      <View style={styles.searchRow}>
        <Ionicons name="search" size={18} color={Colors.textMuted} />
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder={t('watch.placeholder')}
          placeholderTextColor={Colors.textMuted}
          returnKeyType="search"
          onSubmitEditing={() => onSearch(draft.trim())}
          maxLength={80}
          accessibilityLabel={t('watch.search')}
          style={styles.searchInput}
        />
        {!!draft && (
          <Pressable
            onPress={() => {
              setDraft('');
              onSearch('');
            }}
            accessibilityRole="button"
            accessibilityLabel={t('watch.clear')}
            hitSlop={8}>
            <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
          </Pressable>
        )}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: Spacing.xs }}>
        {subjects.map((s) => {
          const on = filter.subject === s.id;
          const subject = getSubject(s.id);
          return (
            <Pressable
              key={s.id}
              onPress={() => onSubject(s.id)}
              accessibilityRole="radio"
              accessibilityState={{ checked: on }}
              style={[styles.chip, on && styles.chipOn]}>
              <Text variant="small" style={{ fontFamily: Fonts.semibold }} color={on ? Colors.primary : Colors.text}>
                {subject ? subjectName(subject, th) : s.id}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
      <View style={styles.searchRow2}>
        <Text variant="small" color={Colors.textSecondary} style={{ flex: 1 }}>
          {t('watch.results', { count: total })}
        </Text>
        <Pressable
          onPress={() => {
            onSearch(draft.trim());
            onDone();
          }}
          accessibilityRole="button"
          style={styles.watchBtn}>
          <Ionicons name="play" size={14} color="#fff" />
          <Text variant="small" color="#fff" style={{ fontFamily: Fonts.bold }}>
            {t('watch.watch')}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function VideoItem({
  video,
  height,
  active,
  onLike,
  onComments,
}: {
  video: WatchVideo;
  height: number;
  active: boolean;
  onLike: (liked: boolean, likes: number) => void;
  onComments: () => void;
}) {
  const { t } = useTranslation('videos');
  const { t: th } = useTranslation('home');
  const { user } = useSession();
  const insets = useSafeAreaInsets();
  const subject = getSubject(video.subject);
  const [hearts, setHearts] = useState<Heart[]>([]);
  const lastTap = useRef(0);

  // Two quick taps anywhere outside the player like the video, with a heart where you tapped.
  const doubleTap = (e: GestureResponderEvent) => {
    const now = tapTime();
    if (now - lastTap.current >= 300) {
      lastTap.current = now;
      return;
    }
    lastTap.current = 0;
    if (!user) return;
    const heart = heartAt(e);
    setHearts((h) => [...h, heart]);
    setTimeout(() => setHearts((h) => h.filter((x) => x.id !== heart.id)), 1000);
    if (!video.liked) void like();
  };

  const like = async () => {
    if (!user) return;
    const next = !video.liked;
    onLike(next, video.likes + (next ? 1 : -1));
    try {
      const res = await reelsApi.like(video.id, next);
      onLike(res.liked, res.likes);
    } catch {
      onLike(!next, video.likes);
    }
  };

  const rail: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    count: string;
    color?: string;
    onPress: () => void;
  }[] = [
    {
      icon: video.liked ? 'heart' : 'heart-outline',
      label: video.liked ? t('feed.unlike') : t('feed.like'),
      count: String(video.likes),
      color: video.liked ? Colors.danger : '#fff',
      onPress: () => void like(),
    },
    {
      icon: 'chatbubble-ellipses-outline',
      label: t('watch.comments'),
      count: String(video.comments),
      onPress: onComments,
    },
    {
      icon: 'arrow-redo-outline',
      label: t('feed.share'),
      count: t('feed.share'),
      onPress: () =>
        void Share.share({
          message: t('watch.shareMessage', { title: video.title, url: `https://youtu.be/${video.youtubeId}` }),
        }).catch(() => {}),
    },
  ];

  return (
    <View style={{ height, backgroundColor: '#000', overflow: 'hidden' }}>
      <Image
        source={{ uri: thumbnail(video.youtubeId) }}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        blurRadius={40}
      />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.6)' }]} />
      <Pressable style={StyleSheet.absoluteFill} onPress={doubleTap} accessible={false} />

      <View style={styles.stage}>
        {active ? (
          <YouTubePlayer videoId={video.youtubeId} title={video.title} autoplay />
        ) : (
          <View style={styles.poster}>
            <Image source={{ uri: thumbnail(video.youtubeId) }} style={StyleSheet.absoluteFill} contentFit="cover" />
            <View style={styles.play}>
              <Ionicons name="play" size={30} color="#fff" />
            </View>
          </View>
        )}
      </View>

      <View style={[styles.rail, { bottom: 40 + insets.bottom }]}>
        {rail.map((r) => (
          <Pressable
            key={r.icon}
            onPress={r.onPress}
            accessibilityRole="button"
            accessibilityLabel={r.label}
            style={styles.railBtn}>
            <Ionicons name={r.icon} size={28} color={r.color ?? '#fff'} />
            <Text variant="label" color="#fff" style={{ fontSize: 10 }}>
              {r.count}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={[styles.info, { bottom: 32 + insets.bottom }]}>
        <View style={styles.tag}>
          <Text style={{ fontFamily: Fonts.bold, fontSize: 11 }} color="#fff" numberOfLines={1}>
            {[subject ? subjectName(subject, th) : video.course, video.chapter].join(' · ')}
          </Text>
        </View>
        <Text style={styles.title} color="#fff" numberOfLines={3}>
          {video.title}
        </Text>
        <Text variant="small" color="rgba(255,255,255,0.75)" numberOfLines={1}>
          {t('watch.meta', { channel: video.channel, minutes: Math.max(1, Math.round(video.seconds / 60)) })}
        </Text>
        <Pressable
          onPress={() => router.push(lessonHref(video) as Href)}
          accessibilityRole="button"
          style={styles.lessonBtn}>
          <Ionicons name="school" size={16} color="#fff" />
          <Text variant="small" color="#fff" style={{ fontFamily: Fonts.bold, flexShrink: 1 }} numberOfLines={1}>
            {t('watch.openLesson', { course: video.course })}
          </Text>
        </Pressable>
      </View>
      {hearts.map((h) => (
        <HeartBurst key={h.id} heart={h} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md, padding: Spacing.xl },
  pill: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  more: { position: 'absolute', bottom: 12, alignSelf: 'center' },
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
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  panel: {
    position: 'absolute',
    left: Spacing.md,
    right: Spacing.md,
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceRaised,
  },
  searchInput: { flex: 1, minHeight: 44, color: Colors.text, fontFamily: Fonts.regular, fontSize: 15 },
  searchRow2: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Radius.pill,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  chipOn: { borderColor: Colors.primary, backgroundColor: Colors.primarySoft },
  watchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.pill,
    backgroundColor: Colors.primary,
  },
  stage: { position: 'absolute', left: 0, right: 0, top: '22%', paddingHorizontal: Spacing.sm },
  poster: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  play: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  rail: { position: 'absolute', right: Spacing.sm, alignItems: 'center', gap: Spacing.md },
  railBtn: { alignItems: 'center', gap: 2, minWidth: 52 },
  info: { position: 'absolute', left: Spacing.md, right: 84, gap: 6 },
  tag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(124,92,255,0.85)',
  },
  title: { fontFamily: Fonts.extrabold, fontSize: 19, lineHeight: 25 },
  lessonBtn: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
});
