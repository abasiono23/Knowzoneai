import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from '@/components/ui/gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { TutorErrorState } from '@/components/tutor/error-state';
import { Button, Card, ProgressBar, Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Gradients, Radius, Spacing } from '@/constants/theme';
import { SCANNED_QUESTION } from '@/lib/tutor/brain';
import { subjectLabel } from '@/lib/tutor/format';
import { useAnswer } from '@/lib/tutor/store';

/**
 * Screen 52: step-by-step explanation. Steps are revealed one at a time so the
 * student can try each step first ("hints before answers").
 */
export default function StepsScreen() {
  const { t } = useTranslation('tutor');
  const { c, m } = useLocalSearchParams<{ c: string; m: string }>();
  const { answer, question } = useAnswer(c, m);
  const [shown, setShown] = useState(1);
  const [openWhy, setOpenWhy] = useState<number | null>(null);

  if (!answer || answer.steps.length === 0) {
    return (
      <Screen withTabBar={false}>
        <ScreenHeader />
        <TutorErrorState
          kind="missing"
          title={t('steps.emptyTitle')}
          body={t('steps.emptyBody')}
          onBack={() => router.back()}
        />
      </Screen>
    );
  }

  const total = answer.steps.length;
  const done = shown >= total;

  return (
    <Screen withTabBar={false}>
      <ScreenHeader eyebrow={t('steps.eyebrow')} eyebrowColor={Colors.success} title={subjectLabel(answer.subject)} />
      {question && (
        <Card raised style={{ gap: 4 }}>
          <Text variant="label" color={Colors.textMuted}>
            {t('steps.problem')}
          </Text>
          <Text variant="heading">{question.text || t('steps.fromPhoto', { question: SCANNED_QUESTION })}</Text>
        </Card>
      )}

      <View style={{ gap: 6 }}>
        <View style={styles.rowBetween}>
          <Text variant="small" color={Colors.textSecondary}>
            {t('steps.progress', { current: Math.min(shown, total), total })}
          </Text>
          {!done && (
            <Pressable
              onPress={() => setShown(total)}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={t('steps.showAll')}>
              <Text variant="small" color={Colors.primary}>
                {t('steps.showAll')}
              </Text>
            </Pressable>
          )}
        </View>
        <ProgressBar progress={Math.min(shown, total) / total} height={6} />
      </View>

      <View style={{ gap: Spacing.sm }}>
        {answer.steps.slice(0, shown).map((s, i) => (
          <Animated.View key={s.title} entering={FadeInDown.duration(350)} style={styles.step}>
            <View style={styles.rail}>
              <LinearGradient colors={i === shown - 1 && !done ? Gradients.ai : Gradients.mastery} style={styles.num}>
                <Text variant="label">{i + 1}</Text>
              </LinearGradient>
              {i < shown - 1 && <View style={styles.line} />}
            </View>
            <Card style={{ flex: 1, gap: Spacing.xs }}>
              <Text variant="bodyStrong">{s.title}</Text>
              <Text color={Colors.textSecondary}>{s.detail}</Text>
              {s.formula && (
                <View style={styles.formula}>
                  <Text style={styles.formulaText}>{s.formula}</Text>
                </View>
              )}
              {s.why && (
                <Pressable
                  onPress={() => setOpenWhy(openWhy === i ? null : i)}
                  accessibilityRole="button"
                  style={styles.why}>
                  <Ionicons
                    name={openWhy === i ? 'chevron-down' : 'help-circle-outline'}
                    size={16}
                    color={Colors.primary}
                  />
                  <Text variant="small" color={Colors.primary}>
                    {openWhy === i ? s.why : t('steps.why')}
                  </Text>
                </Pressable>
              )}
            </Card>
          </Animated.View>
        ))}
      </View>

      {done ? (
        <Animated.View entering={FadeInDown} style={{ gap: Spacing.sm }}>
          {answer.finalAnswer && (
            <LinearGradient colors={Gradients.mastery} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.final}>
              <Ionicons name="trophy" size={24} color={Colors.textOnAccent} />
              <View style={{ flex: 1 }}>
                <Text variant="label" color="rgba(255,255,255,0.85)">
                  {t('steps.finalAnswer')}
                </Text>
                <Text variant="heading">{answer.finalAnswer}</Text>
              </View>
            </LinearGradient>
          )}
          <Button
            title={t('steps.trySimilar')}
            icon="refresh"
            onPress={() => router.push({ pathname: '/tutor/examples', params: { c, m } })}
          />
          <Button
            variant="secondary"
            title={t('steps.quizMe')}
            icon="help-circle"
            onPress={() => router.push({ pathname: '/tutor/quiz', params: { c, m } })}
          />
        </Animated.View>
      ) : (
        <View style={{ gap: Spacing.xs }}>
          <Text variant="small" color={Colors.textMuted} center>
            {t('steps.tryFirst')}
          </Text>
          <Button
            title={t('steps.showNext')}
            icon="footsteps"
            onPress={() => {
              Haptics.selectionAsync().catch(() => {});
              setShown((n) => n + 1);
            }}
          />
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  step: { flexDirection: 'row', gap: Spacing.sm },
  rail: { alignItems: 'center', width: 32 },
  num: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  line: { flex: 1, width: 2, backgroundColor: Colors.success + '66', marginTop: 4 },
  formula: { backgroundColor: Colors.backgroundDeep, borderRadius: Radius.sm, padding: Spacing.sm },
  formulaText: { fontFamily: 'Manrope_700Bold', fontSize: 15, color: Colors.text, textAlign: 'center' },
  why: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  final: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.md, borderRadius: Radius.lg },
});
