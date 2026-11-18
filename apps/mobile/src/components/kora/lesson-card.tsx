import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Rail } from '@/components/content/rail';
import { Text } from '@/components/ui';
import { LinearGradient } from '@/components/ui/gradient';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { formatNumber } from '@/i18n';
import { lessonMinutes, useKoraLessons, useWatchedLessons, type KoraLessonCard as Lesson } from '@/lib/kora/lessons';
import { regionOf } from '@/lib/region';
import { useSession } from '@/lib/session';

/** Kora, head and shoulders, with her smile drawn in (the lesson player draws her mouth live instead). */
export const KORA = require('@/assets/kora/card.webp');
export const COVERS: Record<Lesson['group'], readonly [string, string]> = {
  exam: ['#2A1290', '#6A45FF'],
  cyber: ['#0D2B5E', '#1C82D1'],
  future: ['#3B1D8F', '#B04CFF'],
  skills: ['#0B5D55', '#14B8A6'],
};

/** A lesson's card: Kora on its cover, the exam or kind of lesson, its length, and that it is in English. */
export function KoraLessonCard({ lesson, watched, style }: { lesson: Lesson; watched?: boolean; style?: StyleProp<ViewStyle> }) {
  const { t } = useTranslation('videos');
  return (
    <Pressable
      onPress={() => router.push(`/kora/${lesson.id}`)}
      accessibilityRole="button"
      accessibilityLabel={t('kora.open', { title: lesson.title })}
      style={[styles.card, style]}>
      <LinearGradient colors={COVERS[lesson.group]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.cover}>
        <Image source={KORA} style={styles.kora} contentFit="contain" transition={0} />
        <View style={styles.chip}>
          <Text style={styles.chipText} color="#160A4D">
            {lesson.label}
          </Text>
        </View>
        <View style={styles.play}>
          <Ionicons name="play" size={16} color="#160A4D" style={{ marginLeft: 2 }} />
        </View>
      </LinearGradient>
      <View style={styles.body}>
        <Text variant="bodyStrong" style={styles.title}>
          {lesson.title}
        </Text>
        <View style={styles.meta}>
          <Text variant="small" color={Colors.textSecondary} style={{ flex: 1 }} numberOfLines={1}>
            {t('kora.minutes', { n: formatNumber(lessonMinutes(lesson.seconds)) })} · {t('kora.english')}
          </Text>
          {watched && (
            <View style={styles.watched}>
              <Ionicons name="checkmark-circle" size={14} color={Colors.success} />
              <Text variant="small" color={Colors.success}>
                {t('kora.watched')}
              </Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

/** The home screen's row of lessons for the student's region. Nothing shows until the list arrives, or if it can't be reached. */
export function KoraLessonsRail() {
  const { t } = useTranslation('videos');
  const { user } = useSession();
  const lessons = useKoraLessons(regionOf(user));
  const watched = useWatchedLessons();
  if (!lessons?.length) return null;
  // What is still to watch comes first.
  const sorted = [...lessons.filter((l) => !watched.has(l.id)), ...lessons.filter((l) => watched.has(l.id))];
  return (
    <Rail title={t('kora.title')} onSeeAll={() => router.push('/kora')}>
      {sorted.slice(0, 8).map((l) => (
        <KoraLessonCard key={l.id} lesson={l} watched={watched.has(l.id)} style={{ width: 216 }} />
      ))}
    </Rail>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: Radius.md, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  cover: { height: 118, overflow: 'hidden' },
  kora: { position: 'absolute', right: 2, bottom: -2, width: 106, height: 113 },
  chip: { position: 'absolute', left: Spacing.sm, top: Spacing.sm, backgroundColor: '#FFD84D', borderRadius: Radius.pill, paddingHorizontal: 10, paddingVertical: 3 },
  chipText: { fontFamily: Fonts.extrabold, fontSize: 11.5, lineHeight: 16 },
  play: { position: 'absolute', left: Spacing.sm, bottom: Spacing.sm, width: 34, height: 34, borderRadius: 17, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  body: { padding: Spacing.sm, gap: 4, flex: 1 },
  title: { fontSize: 15, lineHeight: 20, minHeight: 40 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  watched: { flexDirection: 'row', alignItems: 'center', gap: 3 },
});
