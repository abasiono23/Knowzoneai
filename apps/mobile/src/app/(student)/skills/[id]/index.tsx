import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { COVERS, KORA } from '@/components/kora/lesson-card';
import { Button, Card, Screen, ScreenHeader, Text } from '@/components/ui';
import { LinearGradient } from '@/components/ui/gradient';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { errorText } from '@/i18n/errors';
import { lessonsForSkill, loadKoraLessons, useWatchedLessons, type KoraLessonCard } from '@/lib/kora/lessons';
import { skillMinutes, skillsApi, skillThumb, type Skill, type SkillVideo } from '@/lib/skills';

/**
 * A Future skills subject: what it is, then its lessons as one list. Kora's own three-minute lessons
 * on the subject come first (they open in the Lessons with Kora player), then the hand-picked YouTube
 * lessons in order. Each row says which kind it is: "Lesson with Kora", or the YouTube channel.
 */
export default function SkillScreen() {
  const { t } = useTranslation('home');
  const { id } = useLocalSearchParams<{ id: string }>();
  const [skill, setSkill] = useState<Skill | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [kora, setKora] = useState<KoraLessonCard[] | null>(null);

  const load = useCallback(() => {
    skillsApi
      .get(id)
      .then((r) => setSkill(r.skill))
      .catch((e) => setError(errorText(e, t('skills.loadFailed'))));
  }, [id, t]);
  useEffect(load, [load]);

  // Kora's lessons are files on the web app's address, apart from the server's list: either can arrive without the other.
  useEffect(() => {
    let live = true;
    loadKoraLessons()
      .then((all) => live && setKora(lessonsForSkill(all, id)))
      .catch(() => live && setKora([]));
    return () => {
      live = false;
    };
  }, [id]);

  const videos = skill?.videos ?? [];
  const lessons = kora ?? [];
  const waiting = !skill && !error;
  return (
    <Screen withTabBar={false}>
      <ScreenHeader eyebrow={t('explore.collections.future.title').toUpperCase()} title={skill?.name ?? lessons[0]?.subject} />
      {error && (
        <View style={{ gap: Spacing.sm, alignItems: 'center' }}>
          <Text variant="small" color={Colors.textSecondary} center>
            {error}
          </Text>
          <Button
            title={t('skills.retry')}
            variant="secondary"
            onPress={() => {
              setError(null);
              load();
            }}
          />
        </View>
      )}
      {waiting || kora === null ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: Spacing.lg }} />
      ) : (
        <>
          {skill && (
            <Card style={{ gap: Spacing.xs }}>
              <Text variant="label" color={Colors.primary}>
                {t('skills.summary').toUpperCase()}
              </Text>
              <Text>{skill.summary}</Text>
            </Card>
          )}
          {lessons.length + videos.length > 0 && (
            <Text variant="label" color={Colors.textSecondary}>
              {t('skills.lessons', { count: lessons.length + videos.length }).toUpperCase()}
            </Text>
          )}
          <View style={{ gap: Spacing.sm }}>
            {lessons.map((l, i) => (
              <Animated.View key={l.id} entering={FadeInDown.delay(Math.min(i, 8) * 50).duration(350)}>
                <KoraRow lesson={l} />
              </Animated.View>
            ))}
            {videos.map((v, i) => (
              <Animated.View key={v.youtubeId} entering={FadeInDown.delay(Math.min(lessons.length + i, 8) * 50).duration(350)}>
                <VideoRow skillId={id} video={v} />
              </Animated.View>
            ))}
          </View>
        </>
      )}
    </Screen>
  );
}

/** One of Kora's lessons: her picture where a YouTube lesson has its thumbnail, and "Lesson with Kora" where it has its channel. */
function KoraRow({ lesson }: { lesson: KoraLessonCard }) {
  const { t } = useTranslation('home');
  const { t: tv } = useTranslation('videos');
  const watched = useWatchedLessons().has(lesson.id);
  return (
    <Pressable
      onPress={() => router.push(`/kora/${lesson.id}` as Href)}
      accessibilityRole="button"
      accessibilityLabel={tv('kora.open', { title: lesson.title })}
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.8 }]}>
      <LinearGradient colors={COVERS[lesson.group]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.thumb, { overflow: 'hidden' }]}>
        <Image source={KORA} style={styles.kora} contentFit="contain" transition={0} accessible={false} />
        <View style={styles.badge}>
          <Text style={styles.badgeText} color="#160A4D">
            {tv('kora.name')}
          </Text>
        </View>
        <View style={styles.minutesStart}>
          <Text color="#fff" style={{ fontSize: 11 }}>
            {t('skills.minutes', { n: skillMinutes(lesson.seconds) })}
          </Text>
        </View>
      </LinearGradient>
      <View style={{ flex: 1, gap: 3 }}>
        <Text variant="bodyStrong" numberOfLines={3} style={{ fontSize: 15, lineHeight: 20 }}>
          {lesson.title}
        </Text>
        <View style={styles.kind}>
          <Ionicons name={watched ? 'checkmark-circle' : 'school'} size={13} color={watched ? Colors.success : Colors.primary} />
          <Text variant="small" color={Colors.primary} style={{ fontSize: 12, flexShrink: 1 }}>
            {tv('kora.lessonTag')} · {tv('kora.english')}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

function VideoRow({ skillId, video }: { skillId: string; video: SkillVideo }) {
  const { t } = useTranslation('home');
  return (
    <Pressable
      onPress={() => router.push(`/skills/${skillId}/${video.youtubeId}` as Href)}
      accessibilityRole="button"
      accessibilityLabel={video.title}
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.8 }]}>
      <View>
        <Image source={{ uri: skillThumb(video.youtubeId) }} style={styles.thumb} contentFit="cover" transition={150} accessible={false} />
        <View style={styles.minutes}>
          <Text color="#fff" style={{ fontSize: 11 }}>
            {t('skills.minutes', { n: skillMinutes(video.seconds) })}
          </Text>
        </View>
      </View>
      <View style={{ flex: 1, gap: 3 }}>
        <Text variant="bodyStrong" numberOfLines={3} style={{ fontSize: 15, lineHeight: 20 }}>
          {video.title}
        </Text>
        <View style={styles.kind}>
          <Ionicons name="logo-youtube" size={13} color={Colors.textMuted} />
          <Text variant="small" color={Colors.textSecondary} numberOfLines={1} style={{ fontSize: 12, flexShrink: 1 }}>
            {video.channel}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'flex-start' },
  thumb: { width: 136, height: 77, borderRadius: Radius.md, backgroundColor: Colors.surfaceRaised },
  kora: { position: 'absolute', right: 4, bottom: -2, width: 70, height: 75 },
  badge: { position: 'absolute', left: 6, top: 6, backgroundColor: '#FFD84D', borderRadius: Radius.pill, paddingHorizontal: 8, paddingVertical: 1 },
  badgeText: { fontFamily: Fonts.extrabold, fontSize: 11, lineHeight: 16 },
  // On Kora's cover the length sits at the start, clear of her face.
  minutesStart: {
    position: 'absolute',
    bottom: 5,
    left: 6,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  kind: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  minutes: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
});
