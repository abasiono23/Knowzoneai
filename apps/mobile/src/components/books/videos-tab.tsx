import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, type Href } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { Button, Card, Text } from '@/components/ui';
import { LinearGradient } from '@/components/ui/gradient';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { errorText } from '@/i18n/errors';
import { booksApi, type VideoList, type VideoTopic } from '@/lib/books';
import { lessonMedia } from '@/lib/lesson-cards';
import { skillMinutes, skillThumb } from '@/lib/skills';

type Kind = 'all' | 'quick' | 'full' | 'flashcards';
const KINDS: Kind[] = ['all', 'quick', 'full', 'flashcards'];
/** Up to 10 minutes is a quick explainer; longer is a full lesson. */
const QUICK = 10 * 60;

/** Ignores capitals and accents, and the marks that keep Arabic formulas in order. */
const plain = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ًͯ-ٟ⁦-⁩]/g, '')
    .toLowerCase();

type Source =
  /** A school subject's shelf. */
  | { catalogue: string; subject: string; level: string; course?: undefined; stage?: undefined }
  /** A university, polytechnic or college course, with the student's stage. */
  | { course: string; stage: string; catalogue?: undefined; subject?: undefined; level?: undefined };

/** A subject's or course's videos by topic, mixed with its flashcard lessons and "Did you know?" reels. */
export function VideosTab({ catalogue, subject, level, course, stage }: Source) {
  const { t } = useTranslation('books');
  const [list, setList] = useState<VideoList | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [kind, setKind] = useState<Kind>('all');
  const [open, setOpen] = useState<string | null>(null);

  const load = useCallback(() => {
    (course ? booksApi.courseVideos(course, stage) : booksApi.videos(catalogue!, subject!, level!))
      .then(setList)
      .catch((e) => setError(errorText(e, t('shelf.videosLoadFailed'))));
  }, [catalogue, subject, level, course, stage, t]);
  useEffect(load, [load]);

  const words = useMemo(() => plain(q).split(/\s+/).filter(Boolean), [q]);
  const topics = useMemo(() => {
    const fits = (hay: string) => words.every((w) => plain(hay).includes(w));
    return (list?.topics ?? []).flatMap((topic) => {
      const inTopic = fits(topic.title);
      const videos = topic.videos.filter(
        (v) =>
          (kind === 'all' || (kind === 'quick' && v.seconds <= QUICK) || (kind === 'full' && v.seconds > QUICK)) &&
          (inTopic || fits(`${v.title} ${v.channel}`)),
      );
      const flashcards =
        kind === 'all' || kind === 'flashcards' ? topic.flashcards.filter((l) => inTopic || fits(l.title)) : [];
      return videos.length || flashcards.length ? [{ ...topic, videos, flashcards }] : [];
    });
  }, [list, kind, words]);

  if (error)
    return (
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
    );
  if (!list) return <ActivityIndicator color={Colors.primary} style={{ marginTop: Spacing.lg }} />;
  if (!list.topics.length)
    return (
      <Card style={styles.soon}>
        <Ionicons name="play-circle" size={36} color={Colors.primary} />
        <Text variant="heading" center>
          {t('shelf.soon')}
        </Text>
        <Text variant="small" color={Colors.textSecondary} center>
          {t('shelf.soonVideos')}
        </Text>
      </Card>
    );

  const yours = topics.filter((x) => x.yours);
  const more = topics.filter((x) => !x.yours);
  const searching = words.length > 0;
  const showSubject = new Set(list.topics.map((x) => x.library)).size > 1;
  const row = (topic: VideoTopic) => (
    <TopicRow
      key={`${topic.library}/${topic.id}`}
      topic={topic}
      open={searching || open === `${topic.library}/${topic.id}`}
      showSubject={showSubject}
      onToggle={() => setOpen((o) => (o === `${topic.library}/${topic.id}` ? null : `${topic.library}/${topic.id}`))}
    />
  );

  return (
    <>
      <View style={styles.search}>
        <Ionicons name="search" size={18} color={Colors.textMuted} />
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder={t('shelf.videosSearch')}
          placeholderTextColor={Colors.textMuted}
          accessibilityLabel={t('shelf.videosSearch')}
          style={styles.searchInput}
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: Spacing.xs }}>
        {KINDS.map((k) => (
          <Pressable
            key={k}
            onPress={() => setKind(k)}
            accessibilityRole="button"
            accessibilityState={{ selected: kind === k }}
            style={[styles.chip, kind === k && styles.chipOn]}>
            <Text style={{ fontFamily: Fonts.bold, fontSize: 13 }} color={kind === k ? '#fff' : Colors.textSecondary}>
              {t(`shelf.videos_${k}`)}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {list.reels.length > 0 && !searching && (kind === 'all' || kind === 'flashcards') && (
        <Pressable
          onPress={() =>
            router.push({ pathname: '/reels', params: { subject: list.reels.join(',') } } as unknown as Href)
          }
          accessibilityRole="button"
          style={({ pressed }) => [pressed && { transform: [{ scale: 0.98 }] }]}>
          <LinearGradient
            colors={['#6A45FF', '#FF7A93']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.reels}>
            <Ionicons name="bulb" size={24} color="#fff" />
            <View style={{ flex: 1, gap: 2 }}>
              <Text variant="bodyStrong" color="#fff">
                {t('shelf.videosReels')}
              </Text>
              <Text variant="small" color="rgba(255,255,255,0.9)">
                {t('shelf.videosReelsBody')}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#fff" />
          </LinearGradient>
        </Pressable>
      )}

      {yours.length > 0 && (
        <View style={{ gap: Spacing.sm }}>
          <Text variant="label" color={Colors.success}>
            {t('shelf.summaryYours')}
          </Text>
          {yours.map(row)}
        </View>
      )}
      {more.length > 0 && (
        <View style={{ gap: Spacing.sm }}>
          <Text variant="label" color={Colors.textSecondary}>
            {list.topics.some((x) => x.yours) ? t('shelf.summaryMore') : t('shelf.summaryTopics')}
          </Text>
          {more.map(row)}
        </View>
      )}
      {!topics.length && (
        <Text variant="small" color={Colors.textSecondary} center>
          {t('shelf.videosNone')}
        </Text>
      )}
      <Text variant="small" color={Colors.textMuted} center style={{ fontSize: 12 }}>
        {t('shelf.videosEnglish')}
      </Text>
    </>
  );
}

/** One topic: closed by default, so a long list doesn't load every thumbnail at once. */
function TopicRow({
  topic,
  open,
  showSubject,
  onToggle,
}: {
  topic: VideoTopic;
  open: boolean;
  showSubject: boolean;
  onToggle: () => void;
}) {
  const { t } = useTranslation('books');
  const lessons = topic.flashcards;
  return (
    <View style={styles.topic}>
      <Pressable
        onPress={onToggle}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        style={({ pressed }) => [styles.topicHead, pressed && { opacity: 0.8 }]}>
        <View style={{ flex: 1, gap: 3 }}>
          {showSubject && (
            <Text style={{ fontSize: 11, fontFamily: Fonts.bold }} color={Colors.primary}>
              {topic.libraryName}
            </Text>
          )}
          <Text variant="bodyStrong">{topic.title}</Text>
          <View style={styles.counts}>
            {topic.videos.length > 0 && (
              <View style={styles.count}>
                <Ionicons name="play-circle" size={14} color={Colors.textMuted} />
                <Text variant="small" color={Colors.textMuted}>
                  {topic.videos.length}
                </Text>
              </View>
            )}
            {lessons.length > 0 && (
              <View style={styles.count}>
                <Ionicons name="albums" size={14} color={Colors.textMuted} />
                <Text variant="small" color={Colors.textMuted}>
                  {lessons.length}
                </Text>
              </View>
            )}
          </View>
        </View>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={20} color={Colors.textMuted} />
      </Pressable>
      {open && (
        <View style={{ gap: Spacing.sm, paddingHorizontal: Spacing.md, paddingBottom: Spacing.md }}>
          {lessons.map((l) => (
            <Pressable
              key={l.id}
              onPress={() => router.push(`/lesson/${l.id}` as Href)}
              accessibilityRole="button"
              accessibilityLabel={l.title}
              style={({ pressed }) => [styles.video, pressed && { opacity: 0.8 }]}>
              {l.cover ? (
                <Image
                  source={{ uri: lessonMedia(l.cover) }}
                  style={styles.thumb}
                  contentFit="cover"
                  transition={150}
                  accessible={false}
                />
              ) : (
                <View style={[styles.thumb, styles.noCover]}>
                  <Ionicons name="albums" size={24} color={Colors.primary} />
                </View>
              )}
              <View style={{ flex: 1, gap: 3 }}>
                <Text variant="bodyStrong" numberOfLines={3} style={{ fontSize: 14, lineHeight: 19 }}>
                  {l.title}
                </Text>
                <Text style={{ fontSize: 11, fontFamily: Fonts.bold }} color={Colors.primary}>
                  {t('shelf.videos_flashcards')}
                </Text>
              </View>
            </Pressable>
          ))}
          {topic.videos.map((v) => (
            <Pressable
              key={v.youtubeId}
              onPress={() => router.push(`/books/video/${topic.library}/${topic.id}/${v.youtubeId}` as Href)}
              accessibilityRole="button"
              accessibilityLabel={v.title}
              style={({ pressed }) => [styles.video, pressed && { opacity: 0.8 }]}>
              <View>
                <Image
                  source={{ uri: skillThumb(v.youtubeId) }}
                  style={styles.thumb}
                  contentFit="cover"
                  transition={150}
                  accessible={false}
                />
                <View style={styles.minutes}>
                  <Text color="#fff" style={{ fontSize: 11 }}>
                    {t('shelf.videoMinutes', { n: skillMinutes(v.seconds) })}
                  </Text>
                </View>
              </View>
              <View style={{ flex: 1, gap: 3 }}>
                <Text variant="bodyStrong" numberOfLines={3} style={{ fontSize: 14, lineHeight: 19 }}>
                  {v.title}
                </Text>
                <Text variant="small" color={Colors.textSecondary} numberOfLines={1} style={{ fontSize: 12 }}>
                  {v.channel}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  soon: { alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.xl },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: { flex: 1, minHeight: 46, fontFamily: Fonts.regular, fontSize: 15, color: Colors.text },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipOn: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  reels: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.md, borderRadius: Radius.lg },
  topic: { borderRadius: Radius.lg, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  topicHead: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.md },
  counts: { flexDirection: 'row', gap: Spacing.sm },
  count: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  video: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'flex-start' },
  thumb: { width: 120, height: 68, borderRadius: Radius.md, backgroundColor: Colors.surfaceRaised },
  noCover: { alignItems: 'center', justifyContent: 'center' },
  minutes: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
});
