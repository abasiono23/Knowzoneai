import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';

import { LessonRoute } from '@/components/courses/course-route';
import { InteractionView } from '@/components/courses/interaction';
import { CompleteButton, LessonShell } from '@/components/courses/lesson-shell';
import { ProgressRing } from '@/components/courses/progress-ring';
import { Button, Card, Text } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { interactionTitle, interactiveFor, type LessonRef } from '@/lib/courses/catalog';

/** Screen 117: an interactive lesson, one self-checking activity at a time. */
export default function InteractiveLessonScreen() {
  return <LessonRoute>{(ref) => <Interactive lessonRef={ref} />}</LessonRoute>;
}

function Interactive({ lessonRef }: { lessonRef: LessonRef }) {
  const { t } = useTranslation('courses');
  const { lesson } = lessonRef;
  const steps = interactiveFor(lesson);
  const [i, setI] = useState(0);
  const [results, setResults] = useState<(boolean | undefined)[]>([]);
  const [round, setRound] = useState(0);
  const finished = i >= steps.length;
  const answered = results[i] !== undefined;
  const right = results.filter(Boolean).length;

  if (finished) {
    const pct = steps.length ? right / steps.length : 1;
    return (
      <LessonShell lessonRef={lessonRef} progress={1} footer={<CompleteButton lessonRef={lessonRef} />}>
        <View style={styles.summary}>
          <ProgressRing progress={pct} size={150}>
            <Text variant="display">
              {right}/{steps.length}
            </Text>
            <Text variant="small" color={Colors.textMuted}>
              {t('interactive.firstTry')}
            </Text>
          </ProgressRing>
          <Text variant="title" center>
            {pct === 1
              ? t('interactive.flawless')
              : pct >= 0.6
                ? t('interactive.nicelyDone')
                : t('interactive.goodPractice')}
          </Text>
          <Text color={Colors.textSecondary} center>
            {pct === 1 ? t('interactive.allRight') : t('interactive.mistakes')}
          </Text>
        </View>
        <Card style={{ gap: Spacing.xs }}>
          {steps.map((s, k) => (
            <View key={k} style={styles.row}>
              <Ionicons
                name={results[k] ? 'checkmark-circle' : 'ellipse-outline'}
                size={18}
                color={results[k] ? Colors.success : Colors.textMuted}
              />
              <Text variant="small" style={{ flex: 1 }} numberOfLines={1}>
                {t('interactive.stepLine', { title: interactionTitle(s), prompt: s.prompt.split('\n')[0] })}
              </Text>
            </View>
          ))}
        </Card>
        <Button
          variant="ghost"
          icon="refresh"
          title={t('interactive.again')}
          onPress={() => {
            setResults([]);
            setI(0);
            setRound((r) => r + 1);
          }}
        />
      </LessonShell>
    );
  }

  const step = steps[i];
  const prompt = splitPrompt(step.prompt);
  return (
    <LessonShell
      lessonRef={lessonRef}
      progress={(i + (answered ? 1 : 0)) / steps.length}
      footer={
        <Button
          title={i === steps.length - 1 ? t('interactive.seeHow') : t('interactive.nextActivity')}
          icon="arrow-forward"
          disabled={!answered}
          onPress={() => setI(i + 1)}
        />
      }>
      <Animated.View key={`${round}-${i}`} entering={FadeInRight.duration(260)} style={{ gap: Spacing.md }}>
        <View style={styles.head}>
          <View style={styles.badge}>
            <Text variant="label" color={Colors.reward}>
              {interactionTitle(step).toUpperCase()}
            </Text>
          </View>
          <Text variant="small" color={Colors.textMuted}>
            {t('interactive.stepOf', { number: i + 1, total: steps.length })}
          </Text>
        </View>
        <Text variant="heading">{prompt.question}</Text>
        {!!prompt.code && (
          <View style={styles.code}>
            <Text style={styles.codeText}>{prompt.code}</Text>
          </View>
        )}
        <InteractionView
          item={step}
          seed={`${lesson.id}-${i}-${round}`}
          onDone={(ok) => setResults((r) => Object.assign([...r], { [i]: ok }))}
        />
      </Animated.View>
    </LessonShell>
  );
}

/** Prompts may embed a code snippet: the plain sentence is the question, the rest is code. */
function splitPrompt(text: string) {
  const chunks = text.split('\n\n');
  if (chunks.length === 1) return { question: text, code: '' };
  const question = chunks.find((c) => !c.includes('\n') && /[?.:]$/.test(c.trim())) ?? chunks[0];
  return { question, code: chunks.filter((c) => c !== question).join('\n\n') };
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.pill, backgroundColor: Colors.rewardSoft },
  code: {
    padding: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: '#05081A',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  codeText: { fontFamily: 'monospace', fontSize: 15, lineHeight: 22, color: '#C3F0FF' },
  summary: { alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.lg },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
});
