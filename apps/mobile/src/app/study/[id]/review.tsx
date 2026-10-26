import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { ReadyMaterial } from '@/components/materials/ready-material';
import { Button, Card, Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useSession } from '@/lib/session';

/** Screen 81: go through every incorrect answer with the right answer and why. */
export default function ReviewIncorrectScreen() {
  const { t } = useTranslation('study');
  const { a } = useLocalSearchParams<{ a: string }>();
  const { user } = useSession();
  return (
    <ReadyMaterial>
      {(m) => {
        const attempt = m.attempts.find((x) => x.id === a);
        const byId = new Map(m.content.quiz.map((q) => [q.id, q]));
        const missed = (attempt?.questionIds ?? [])
          .map((qid, n) => ({ q: byId.get(qid), given: attempt!.answers[n] }))
          .filter(
            (x): x is { q: NonNullable<typeof x.q>; given: number | null } => !!x.q && x.given !== x.q.correctIndex,
          );

        return (
          <Screen withTabBar={false}>
            <ScreenHeader
              eyebrow={t('review.eyebrow', { count: missed.length })}
              eyebrowColor={Colors.danger}
              title={t('review.title')}
            />
            {missed.map(({ q, given }, i) => (
              <Animated.View key={q.id} entering={FadeInDown.delay(i * 60)}>
                <Card style={{ gap: Spacing.sm }}>
                  <Text variant="label" color={Colors.textMuted}>
                    {q.concept.toUpperCase()}
                  </Text>
                  <Text variant="bodyStrong">{q.question}</Text>
                  <View style={[styles.answer, styles.wrong]}>
                    <Ionicons name="close-circle" size={18} color={Colors.danger} />
                    <Text variant="small" style={{ flex: 1 }}>
                      {t('review.yourAnswer', { answer: given === null ? t('review.noAnswer') : q.options[given] })}
                    </Text>
                  </View>
                  <View style={[styles.answer, styles.right]}>
                    <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
                    <Text variant="small" style={{ flex: 1 }}>
                      {t('review.correct', { answer: q.options[q.correctIndex] })}
                    </Text>
                  </View>
                  <View style={styles.why}>
                    <Ionicons name="bulb" size={16} color={Colors.reward} />
                    <Text variant="small" color={Colors.textSecondary} style={{ flex: 1 }}>
                      {q.explanation}
                    </Text>
                  </View>
                </Card>
              </Animated.View>
            ))}
            {user?.role !== 'teacher' && (
              <Button
                title={t('review.askTutor')}
                icon="chatbubbles"
                // The chat answers from this study pack.
                onPress={() => router.push({ pathname: '/tutor/new', params: { pack: m.id } })}
              />
            )}
            <Button
              variant="secondary"
              title={t('review.studyCards')}
              icon="albums"
              onPress={() => router.push(`/study/${m.id}/study`)}
            />
          </Screen>
        );
      }}
    </ReadyMaterial>
  );
}

const styles = StyleSheet.create({
  answer: {
    flexDirection: 'row',
    gap: Spacing.xs,
    alignItems: 'flex-start',
    padding: Spacing.sm,
    borderRadius: Radius.sm,
  },
  wrong: { backgroundColor: Colors.dangerSoft },
  right: { backgroundColor: Colors.successSoft },
  why: { flexDirection: 'row', gap: Spacing.xs, alignItems: 'flex-start' },
});
