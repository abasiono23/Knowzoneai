import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, View, type ScrollViewInstance } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  Explanation,
  LoadError,
  Loading,
  OptionRow,
  Passage,
  QuestionHead,
  type OptionState,
} from '@/components/exams/ui';
import { ConfirmDialog } from '@/components/world/overlays';
import { Button, Card, ProgressBar, Text } from '@/components/ui';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { errorText } from '@/i18n/errors';
import { clock, examsApi, LETTERS, loadPaper, type ExamAttempt, type Paper, type TopicScore } from '@/lib/exams';

type Mode = 'practice' | 'timed';

/**
 * Sitting a paper. Practice: answer, check, see the explanation, move on. Timed: the real time limit,
 * move freely with the question map, hand in at the end (or when time runs out). The server marks it.
 */
export default function SitPaper() {
  const { t } = useTranslation('exams');
  const { id, mode: m } = useLocalSearchParams<{ id: string; mode?: string }>();
  const mode: Mode = m === 'timed' ? 'timed' : 'practice';
  const [paper, setPaper] = useState<Paper | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    loadPaper(id)
      .then(setPaper)
      .catch((e) => setError(errorText(e, t('loadFailed'))));
  }, [id, t]);
  useEffect(load, [load]);
  const retry = () => {
    setError(null);
    load();
  };

  if (error || !paper)
    return (
      <SafeAreaView style={styles.fill}>
        <View style={{ padding: Spacing.md }}>{error ? <LoadError text={error} onRetry={retry} /> : <Loading />}</View>
      </SafeAreaView>
    );
  return <Sitting paper={paper} mode={mode} />;
}

function Sitting({ paper, mode }: { paper: Paper; mode: Mode }) {
  const { t } = useTranslation('exams');
  const total = paper.questions.length;
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<number[]>(() => paper.questions.map(() => -1));
  const [checked, setChecked] = useState<boolean[]>(() => paper.questions.map(() => false));
  const [startedAt] = useState(() => Date.now());
  const [left, setLeft] = useState(paper.minutes * 60);
  const [confirm, setConfirm] = useState<'submit' | 'leave' | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ attempt: ExamAttempt; topics: TopicScore[]; timeUp: boolean } | null>(null);
  const scroll = useRef<ScrollViewInstance | null>(null);

  const q = paper.questions[i]!;
  const answered = answers.filter((a) => a >= 0).length;

  const submit = async (timeUp = false) => {
    if (busy || result) return;
    setBusy(true);
    setConfirm(null);
    try {
      const res = await examsApi.submit(paper.id, mode, answers, Math.round((Date.now() - startedAt) / 1000));
      setResult({ ...res, timeUp });
    } catch (e) {
      setNote(errorText(e, t('loadFailed')));
    } finally {
      setBusy(false);
    }
  };
  const submitRef = useRef(submit);
  useEffect(() => {
    submitRef.current = submit;
  });

  // The clock (timed papers only); time running out hands the paper in.
  useEffect(() => {
    if (mode !== 'timed' || result) return;
    const end = startedAt + paper.minutes * 60_000;
    const tick = setInterval(() => {
      const remaining = Math.max(0, Math.round((end - Date.now()) / 1000));
      setLeft(remaining);
      if (remaining <= 0) {
        clearInterval(tick);
        void submitRef.current(true);
      }
    }, 500);
    return () => clearInterval(tick);
  }, [mode, result, startedAt, paper.minutes]);

  const go = (n: number) => {
    setI(Math.max(0, Math.min(total - 1, n)));
    setNote(null);
    scroll.current?.scrollTo({ y: 0, animated: false });
  };
  const pick = (k: number) => {
    if (mode === 'practice' && checked[i]) return;
    setAnswers((a) => a.map((v, j) => (j === i ? k : v)));
    setNote(null);
  };

  if (result) return <Result paper={paper} answers={answers} result={result} mode={mode} />;

  const state = (k: number): OptionState => {
    if (mode === 'practice' && checked[i]) return k === q.answer ? 'right' : k === answers[i] ? 'wrong' : 'idle';
    return k === answers[i] ? 'picked' : 'idle';
  };

  return (
    <View style={styles.fill}>
      <SafeAreaView edges={['top']} style={styles.top}>
        <Pressable
          onPress={() => setConfirm('leave')}
          accessibilityRole="button"
          accessibilityLabel={t('sit.leave')}
          hitSlop={10}
          style={styles.close}>
          <Ionicons name="close" size={22} color={Colors.text} />
        </Pressable>
        <View style={{ flex: 1, gap: 4 }}>
          <Text variant="small" color={Colors.textSecondary}>
            {t('sit.question', { n: i + 1, total })}
          </Text>
          <ProgressBar progress={(mode === 'timed' ? answered : i + (checked[i] ? 1 : 0)) / total} height={6} />
        </View>
        {mode === 'timed' && (
          <View style={[styles.timer, left < 60 && { backgroundColor: Colors.dangerSoft }]}>
            <Ionicons name="timer-outline" size={16} color={left < 60 ? Colors.danger : Colors.reward} />
            <Text style={{ fontFamily: Fonts.bold, color: left < 60 ? Colors.danger : Colors.reward }}>
              {clock(left)}
            </Text>
          </View>
        )}
      </SafeAreaView>

      <ScrollView ref={scroll} contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        {q.passage && <Passage text={q.passage} />}
        <QuestionHead q={q} />
        <View style={{ gap: Spacing.sm }}>
          {q.options.map((o, k) => (
            <OptionRow key={k} index={k} text={o} state={state(k)} onPress={() => pick(k)} />
          ))}
        </View>
        {mode === 'practice' && checked[i] && (
          <>
            <Text variant="bodyStrong" color={answers[i] === q.answer ? Colors.success : Colors.danger}>
              {answers[i] === q.answer ? t('sit.correct') : t('sit.wrong', { letter: LETTERS[q.answer] })}
            </Text>
            <Explanation title={t('study.why')} text={q.explanation} />
          </>
        )}
        {!!note && (
          <Text variant="small" color={Colors.danger}>
            {note}
          </Text>
        )}

        {mode === 'timed' && (
          <View style={{ gap: Spacing.xs }}>
            <Text variant="label" color={Colors.textSecondary}>
              {t('sit.map')}
            </Text>
            <View style={styles.map}>
              {paper.questions.map((x, j) => (
                <Pressable
                  key={x.n}
                  onPress={() => go(j)}
                  accessibilityRole="button"
                  accessibilityLabel={t('sit.question', { n: j + 1, total })}
                  style={[
                    styles.cell,
                    answers[j]! >= 0 && styles.cellDone,
                    j === i && { borderColor: Colors.reward, borderWidth: 2 },
                  ]}>
                  <Text
                    style={{
                      fontFamily: Fonts.bold,
                      fontSize: 12,
                      color: answers[j]! >= 0 ? '#fff' : Colors.textSecondary,
                    }}>
                    {j + 1}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      <SafeAreaView edges={['bottom']} style={styles.bottom}>
        {mode === 'practice' ? (
          !checked[i] ? (
            <Button
              title={t('sit.check')}
              icon="checkmark"
              onPress={() =>
                answers[i]! < 0 ? setNote(t('sit.choose')) : setChecked((c) => c.map((v, j) => (j === i ? true : v)))
              }
            />
          ) : i < total - 1 ? (
            <Button title={t('sit.next')} icon="arrow-forward" onPress={() => go(i + 1)} />
          ) : (
            <Button title={t('sit.submit')} icon="flag" loading={busy} onPress={() => void submit()} />
          )
        ) : (
          <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
            <View style={{ flex: 1 }}>
              <Button title={t('sit.previous')} variant="secondary" disabled={i === 0} onPress={() => go(i - 1)} />
            </View>
            <View style={{ flex: 1 }}>
              {i < total - 1 ? (
                <Button title={t('sit.next')} onPress={() => go(i + 1)} />
              ) : (
                <Button title={t('sit.submit')} loading={busy} onPress={() => setConfirm('submit')} />
              )}
            </View>
          </View>
        )}
      </SafeAreaView>

      <ConfirmDialog
        visible={confirm === 'submit'}
        icon="flag"
        title={t('sit.submitTitle')}
        body={t('sit.submitBody', { answered, total })}
        confirmLabel={t('sit.submitConfirm')}
        cancelLabel={t('sit.keepGoing')}
        onConfirm={() => void submit()}
        onCancel={() => setConfirm(null)}
      />
      <ConfirmDialog
        visible={confirm === 'leave'}
        icon="exit-outline"
        destructive
        title={t('sit.leaveTitle')}
        body={t('sit.leaveBody')}
        confirmLabel={t('sit.leave')}
        cancelLabel={t('sit.keepGoing')}
        onConfirm={() => {
          setConfirm(null);
          router.back();
        }}
        onCancel={() => setConfirm(null)}
      />
    </View>
  );
}

function Result({
  paper,
  answers,
  result,
  mode,
}: {
  paper: Paper;
  answers: number[];
  result: { attempt: ExamAttempt; topics: TopicScore[]; timeUp: boolean };
  mode: Mode;
}) {
  const { t } = useTranslation('exams');
  const { attempt, topics, timeUp } = result;
  const pct = Math.round((attempt.score / attempt.total) * 100);
  const weak = topics.filter((x) => x.right / x.total < 0.5).map((x) => x.topic);
  return (
    <SafeAreaView style={styles.fill}>
      <ScrollView contentContainerStyle={styles.body}>
        <Card style={{ alignItems: 'center', gap: Spacing.xs }}>
          {timeUp && (
            <Text variant="small" color={Colors.danger}>
              {t('sit.timeUp')}
            </Text>
          )}
          <Text variant="label" color={Colors.textSecondary}>
            {t('result.title')}
          </Text>
          <Text
            style={{ fontFamily: Fonts.extrabold, fontSize: 44, color: pct >= 50 ? Colors.success : Colors.danger }}>
            {t('result.percent', { pct })}
          </Text>
          <Text variant="heading">{t('result.score', { score: attempt.score, total: attempt.total })}</Text>
          <Text variant="small" color={Colors.textSecondary}>
            {t('result.time', { time: clock(attempt.seconds) })}
          </Text>
          <Text variant="bodyStrong">
            {pct >= 75 ? t('result.excellent') : pct >= 50 ? t('result.good') : t('result.keep')}
          </Text>
        </Card>

        <Card style={{ gap: Spacing.sm }}>
          <Text variant="label" color={Colors.textSecondary}>
            {t('result.byTopic')}
          </Text>
          {topics.map((x) => (
            <View key={x.topic} style={{ gap: 4 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.sm }}>
                <Text variant="small" style={{ flex: 1 }}>
                  {x.topic}
                </Text>
                <Text variant="small" color={x.right / x.total >= 0.5 ? Colors.success : Colors.danger}>
                  {t('result.topicRow', { right: x.right, total: x.total })}
                </Text>
              </View>
              <ProgressBar progress={x.right / x.total} height={6} />
            </View>
          ))}
          {weak.length > 0 && (
            <Text variant="small" color={Colors.reward}>
              {t('result.revise', { topics: weak.slice(0, 3).join(', ') })}
            </Text>
          )}
        </Card>

        <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
          <View style={{ flex: 1 }}>
            <Button
              title={t('result.again')}
              variant="secondary"
              icon="refresh"
              onPress={() => router.replace(`/exams/paper/${paper.id}/sit?mode=${mode}` as Href)}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Button title={t('result.back')} onPress={() => router.back()} />
          </View>
        </View>

        <Text variant="label" color={Colors.textSecondary}>
          {t('result.review')}
        </Text>
        {paper.questions.map((q, j) => (
          <View key={q.n} style={{ gap: Spacing.sm }}>
            {q.passage && q.passage !== paper.questions[j - 1]?.passage && <Passage text={q.passage} />}
            <Card style={{ gap: Spacing.sm }}>
              <QuestionHead q={q} label={t('sit.question', { n: q.n, total: paper.questions.length })} />
              {q.options.map((o, k) => (
                <OptionRow
                  key={k}
                  index={k}
                  text={o}
                  state={k === q.answer ? 'right' : k === answers[j] ? 'wrong' : 'idle'}
                />
              ))}
              <Text variant="small" color={answers[j] === q.answer ? Colors.success : Colors.danger}>
                {answers[j]! >= 0 ? t('result.yours', { letter: LETTERS[answers[j]!] }) : t('result.skipped')}
              </Text>
              <Explanation title={t('study.why')} text={q.explanation} />
            </Card>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: Colors.background },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  close: {
    width: 40,
    height: 40,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
  },
  timer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.pill,
    backgroundColor: Colors.rewardSoft,
  },
  body: { padding: Spacing.md, gap: Spacing.md, paddingBottom: Spacing.xxl },
  bottom: { paddingHorizontal: Spacing.md, paddingTop: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.border },
  map: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  cell: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  cellDone: { backgroundColor: Colors.primary, borderColor: Colors.primary },
});
