import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';

import { AuthScreen } from '@/components/auth/auth-screen';
import { CourseRoute } from '@/components/courses/course-route';
import { SuccessBadge } from '@/components/onboarding/success-badge';
import { ChoiceChip, ChipWrap } from '@/components/personalize/choice-chip';
import { Button, Text } from '@/components/ui';
import { Colors, Fonts, NoWebOutline, Radius, Spacing } from '@/constants/theme';
import { useCourses } from '@/lib/courses/store';
import type { Course } from '@/lib/courses/types';

/** Star labels by rating (1–5); text lives in `courses:rate.labels`. */
const LABELS = ['', 'poor', 'needsWork', 'good', 'great', 'excellent'] as const;

/**
 * Feedback tags. The English value is what the rating stores, so saved reviews stay the same in every
 * language; the key picks the label shown (`courses:rate.good.*` / `courses:rate.bad.*`).
 */
const GOOD = {
  clear: 'Clear explanations',
  examples: 'Great examples',
  exams: 'Helped in exams',
  fun: 'Fun activities',
  length: 'Right length',
  videos: 'Good videos',
} as const;
const BAD = {
  fast: 'Too fast',
  basic: 'Too basic',
  confusing: 'Confusing in places',
  practice: 'Needs more practice',
  media: 'Audio or video issues',
  errors: 'Errors in content',
} as const;
type Tag = { key: string; value: string; group: 'good' | 'bad' };
const tagsOf = (group: 'good' | 'bad'): Tag[] =>
  Object.entries(group === 'good' ? GOOD : BAD).map(([key, value]) => ({ key, value, group }));

/** Screen 126: rate a course and leave feedback for the instructor. */
export default function RateCourseScreen() {
  return <CourseRoute>{(c) => <Rate course={c} />}</CourseRoute>;
}

function Rate({ course }: { course: Course }) {
  const { t } = useTranslation('courses');
  const { ratings, rate } = useCourses();
  const prev = ratings[course.id];
  const [stars, setStars] = useState(prev?.stars ?? 0);
  const [tags, setTags] = useState<string[]>(prev?.tags ?? []);
  const [text, setText] = useState(prev?.text ?? '');
  const [sent, setSent] = useState(false);
  const options = stars >= 4 ? tagsOf('good') : stars > 0 ? tagsOf('bad') : [];
  const values = options.map((o) => o.value);
  const tagLabel = (o: Tag) =>
    o.group === 'good'
      ? t(`rate.good.${o.key as keyof typeof GOOD}`)
      : t(`rate.bad.${o.key as keyof typeof BAD}`);

  if (sent)
    return (
      <AuthScreen
        center
        back={false}
        hero={<SuccessBadge icon="heart" colors={['#FF7A93', '#7C5CFF']} />}
        title={t('rate.thanksTitle')}
        subtitle={stars >= 4 ? t('rate.thanksGood') : t('rate.thanksBad')}
        footer={<Button title={t('actions.done', { ns: 'common' })} onPress={() => router.back()} />}
      />
    );

  return (
    <AuthScreen
      title={prev ? t('details.editReview') : t('details.rateCourse')}
      subtitle={course.title}
      footer={
        <Button
          title={prev ? t('rate.update') : t('rate.submit')}
          icon="send"
          disabled={!stars}
          onPress={() => {
            rate(course.id, { stars, tags: tags.filter((x) => values.includes(x)), text: text.trim() });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
            setSent(true);
          }}
        />
      }>
      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Pressable
            key={i}
            onPress={() => {
              Haptics.selectionAsync().catch(() => {});
              setStars(i);
            }}
            accessibilityRole="button"
            accessibilityState={{ selected: stars === i }}
            accessibilityLabel={t('rate.starA11y', { count: i })}
            hitSlop={4}>
            {i <= stars ? (
              <Animated.View key={`on-${i}-${stars}`} entering={ZoomIn.duration(200).delay(i * 30)}>
                <Ionicons name="star" size={44} color={Colors.reward} />
              </Animated.View>
            ) : (
              <Ionicons name="star-outline" size={44} color={Colors.textMuted} />
            )}
          </Pressable>
        ))}
      </View>
      <Text variant="heading" center color={stars ? Colors.reward : Colors.textMuted}>
        {stars ? t(`rate.labels.${LABELS[stars] as Exclude<(typeof LABELS)[number], ''>}`) : t('rate.tapStar')}
      </Text>

      {options.length > 0 && (
        <View style={{ gap: Spacing.sm }}>
          <Text variant="bodyStrong">{stars >= 4 ? t('rate.liked') : t('rate.better')}</Text>
          <ChipWrap>
            {options.map((o) => (
              <ChoiceChip
                key={o.key}
                label={tagLabel(o)}
                selected={tags.includes(o.value)}
                onPress={() =>
                  setTags((s) => (s.includes(o.value) ? s.filter((x) => x !== o.value) : [...s, o.value]))
                }
              />
            ))}
          </ChipWrap>
        </View>
      )}

      {stars > 0 && (
        <View style={{ gap: Spacing.xs }}>
          <Text variant="bodyStrong">{t('rate.anythingElse')}</Text>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder={stars >= 4 ? t('rate.placeholderGood') : t('rate.placeholderBad')}
            placeholderTextColor={Colors.textMuted}
            multiline
            maxLength={500}
            style={styles.input}
            accessibilityLabel={t('rate.feedbackA11y')}
          />
          <Text variant="small" color={Colors.textMuted} style={{ alignSelf: 'flex-end', fontSize: 11 }}>
            {text.length}/500
          </Text>
        </View>
      )}
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  stars: { flexDirection: 'row', justifyContent: 'center', gap: Spacing.xs, paddingVertical: Spacing.md },
  input: {
    ...NoWebOutline,
    minHeight: 110,
    color: Colors.text,
    fontFamily: Fonts.regular,
    fontSize: 15,
    lineHeight: 22,
    textAlignVertical: 'top',
    padding: Spacing.sm,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
});
