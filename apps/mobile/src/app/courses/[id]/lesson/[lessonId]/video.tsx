import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { LessonRoute } from '@/components/courses/course-route';
import { YouTubePlayer } from '@/components/courses/youtube-player';
import { CompleteButton, LessonShell } from '@/components/courses/lesson-shell';
import { ScenePlayer } from '@/components/videos/scene-player';
import { Card, Text } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { getSubject } from '@/lib/catalog';
import { keyPointsFor, scenesFor, type LessonRef } from '@/lib/courses/catalog';
import { getInstructor } from '@/lib/courses/instructors';
import { useCourses } from '@/lib/courses/store';
import { DEFAULT_VIDEO_SETTINGS } from '@/lib/videos/store';
import { clock, durationOf, type Video } from '@/lib/videos/types';

/** Screen 116: a video lesson, with chapters, key points and a transcript. Finishing the video completes it. */
export default function VideoLessonScreen() {
  return <LessonRoute>{(ref) => <VideoLesson lessonRef={ref} />}</LessonRoute>;
}

function VideoLesson({ lessonRef }: { lessonRef: LessonRef }) {
  const { t } = useTranslation('courses');
  const { course, lesson } = lessonRef;
  const { complete } = useCourses();
  const [seek, setSeek] = useState({ at: 0, n: 0 });
  const [time, setTime] = useState(0);
  const [showTranscript, setShowTranscript] = useState(false);

  const video = useMemo<Video>(
    () => ({
      id: `course-${course.id}-${lesson.id}`,
      title: lesson.title,
      subject: getSubject(course.subjectId)?.name ?? course.title,
      level: course.level,
      description: lesson.summary,
      creator: getInstructor(course.instructorId)?.name ?? 'Knowzone',
      scenes: scenesFor(lesson),
      settings: { ...DEFAULT_VIDEO_SETTINGS, voiceId: 'grace', styleId: 'galaxy' },
      origin: 'catalog',
      views: 0,
      likes: 0,
      createdAt: 0,
    }),
    [course, lesson],
  );
  const starts = video.scenes.reduce<number[]>(
    (acc, s, i) => [...acc, i === 0 ? 0 : acc[i - 1] + video.scenes[i - 1].seconds],
    [],
  );
  const current = starts.reduce((n, s, i) => (time >= s ? i : n), 0);

  // Real courses: the chapter's YouTube video, in YouTube's own player.
  const yt = lesson.content?.video;
  if (yt) {
    const points = keyPointsFor(lesson);
    return (
      <LessonShell lessonRef={lessonRef} dark footer={<CompleteButton lessonRef={lessonRef} />}>
        <YouTubePlayer videoId={yt.youtubeId} title={yt.title} />
        <View style={{ gap: 4 }}>
          <Text variant="title">{yt.title}</Text>
          <Text variant="small" color={Colors.textSecondary}>
            {t('video.youtubeMeta', { channel: yt.channel, duration: clock(yt.seconds) })}
          </Text>
        </View>
        {points.length > 0 && (
          <Card style={{ gap: Spacing.sm }}>
            <Text variant="label" color={Colors.success}>
              {t('read.keyPoints')}
            </Text>
            {points.map((k) => (
              <View key={k} style={styles.point}>
                <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
                <Text style={{ flex: 1 }}>{k}</Text>
              </View>
            ))}
          </Card>
        )}
        <Text variant="small" color={Colors.textMuted} style={{ fontSize: 12 }}>
          {t('video.youtubeNote')}
        </Text>
      </LessonShell>
    );
  }

  return (
    <LessonShell
      lessonRef={lessonRef}
      dark
      progress={time / Math.max(1, durationOf(video.scenes))}
      footer={<CompleteButton lessonRef={lessonRef} />}>
      <View style={styles.player}>
        {video.scenes.length ? (
          <ScenePlayer
            key={seek.n}
            video={video}
            startAt={seek.at}
            // The scene already shows the narration text; the CC button and transcript cover the rest.
            captions={false}
            onTime={setTime}
            onEnded={() => complete(course.id, lesson.id)}
          />
        ) : (
          <View style={styles.empty}>
            <Ionicons name="videocam-off-outline" size={32} color={Colors.textMuted} />
            <Text variant="small" color={Colors.textMuted}>
              {t('video.producing')}
            </Text>
          </View>
        )}
      </View>

      <View style={{ gap: 4 }}>
        <Text variant="title">{lesson.title}</Text>
        <Text variant="small" color={Colors.textSecondary}>
          {t('video.meta', {
            duration: clock(durationOf(video.scenes)),
            chapters: t('video.chapters', { count: video.scenes.length }),
            name: video.creator,
          })}
        </Text>
      </View>

      <Card style={{ gap: 2, padding: Spacing.xs }}>
        <Text variant="label" color={Colors.textMuted} style={{ padding: Spacing.xs }}>
          {t('video.chaptersTitle')}
        </Text>
        {video.scenes.map((s, i) => (
          <Pressable
            key={s.id}
            onPress={() => setSeek((x) => ({ at: starts[i], n: x.n + 1 }))}
            accessibilityRole="button"
            accessibilityLabel={t('video.jump', { heading: s.heading, time: clock(starts[i]) })}
            style={[styles.chapter, i === current && styles.chapterOn]}>
            <Text variant="small" color={i === current ? Colors.primary : Colors.textMuted} style={styles.time}>
              {clock(starts[i])}
            </Text>
            <Text
              variant="small"
              style={{ flex: 1 }}
              numberOfLines={1}
              color={i === current ? Colors.text : Colors.textSecondary}>
              {s.heading}
            </Text>
            {i === current && <Ionicons name="volume-medium" size={14} color={Colors.primary} />}
          </Pressable>
        ))}
      </Card>

      <Card style={{ gap: Spacing.sm }}>
        <Text variant="label" color={Colors.success}>
          {t('read.keyPoints')}
        </Text>
        {keyPointsFor(lesson).map((k) => (
          <View key={k} style={styles.point}>
            <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
            <Text style={{ flex: 1 }}>{k}</Text>
          </View>
        ))}
      </Card>

      <Pressable
        onPress={() => setShowTranscript((v) => !v)}
        accessibilityRole="button"
        accessibilityState={{ expanded: showTranscript }}
        accessibilityLabel={t('video.transcript')}
        style={styles.toggle}>
        <Ionicons name="document-text-outline" size={18} color={Colors.primary} />
        <Text variant="bodyStrong" style={{ flex: 1 }}>
          {t('video.transcript')}
        </Text>
        <Ionicons name={showTranscript ? 'chevron-up' : 'chevron-down'} size={18} color={Colors.textMuted} />
      </Pressable>
      {showTranscript &&
        video.scenes.map((s, i) => (
          <View key={s.id} style={styles.line}>
            <Text variant="label" color={Colors.textMuted}>
              {clock(starts[i])}
            </Text>
            <Text color={i === current ? Colors.text : Colors.textSecondary}>{s.caption}</Text>
          </View>
        ))}
    </LessonShell>
  );
}

const styles = StyleSheet.create({
  player: { height: 420, borderRadius: Radius.lg, overflow: 'hidden', backgroundColor: '#000' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.xs },
  chapter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: Radius.sm,
  },
  chapterOn: { backgroundColor: Colors.primarySoft },
  time: { width: 40, fontVariant: ['tabular-nums'] },
  point: { flexDirection: 'row', gap: Spacing.xs, alignItems: 'flex-start' },
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    padding: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  line: { gap: 2, paddingHorizontal: Spacing.xs },
});
