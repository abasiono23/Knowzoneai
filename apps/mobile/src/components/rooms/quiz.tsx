import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Chip, Sheet } from '@/components/rooms/ui';
import { Button, Card, ProgressBar, Text } from '@/components/ui';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { EXAM_IDS, LETTERS, pretty, SUBJECT_ICONS, type ExamId, type ExamSubjectId } from '@/lib/exams';
import { quizStage, type RoomQuiz } from '@/lib/rooms';

const SUBJECTS = Object.keys(SUBJECT_ICONS) as ExamSubjectId[];
const MEDALS = ['🥇', '🥈', '🥉'];

/**
 * A quiz battle in the room: a countdown, then each question for everyone at once. Answers lock in
 * and the right one shows when time is up, with how many people picked each option. Then the results.
 */
export function QuizCard({
  quiz,
  now,
  host,
  picked,
  onAnswer,
  onAgain,
  onClose,
}: {
  quiz: RoomQuiz;
  /** Server time. */
  now: number;
  host: boolean;
  /** Answers sent from this phone that the server hasn't confirmed yet. */
  picked: Record<number, number>;
  onAnswer: (index: number, choice: number) => void;
  onAgain: () => void;
  onClose: () => void;
}) {
  const { t } = useTranslation('rooms');
  const te = useTranslation('exams').t as unknown as (key: string) => string;
  const st = quizStage(quiz, now);
  const total = quiz.questions.length;
  const title = `${te(`exams.${quiz.exam}.name`)} · ${te(`subjects.${quiz.subject}`)}`;
  const head = (
    <View style={styles.head}>
      <Ionicons name="trophy" size={18} color={Colors.reward} />
      <Text variant="label" color={Colors.reward} style={{ flex: 1 }}>
        {t('quiz.title')}
      </Text>
      <Text variant="small" color={Colors.textSecondary}>
        {title}
      </Text>
    </View>
  );

  if (st.stage === 'lead')
    return (
      <Card style={[styles.card, { alignItems: 'center' }]}>
        {head}
        <Text style={styles.big}>{Math.ceil(st.left / 1000)}</Text>
        <Text variant="bodyStrong" center>
          {t('quiz.ready')}
        </Text>
      </Card>
    );

  if (st.stage === 'done') {
    const mine = quiz.scores.findIndex((s) => s.me);
    const xp = mine < 0 ? 0 : quiz.scores[mine]!.correct * 3 + (mine === 0 && quiz.scores[0]!.points > 0 ? 10 : 0);
    return (
      <Card style={styles.card}>
        {head}
        <Text variant="heading">{t('quiz.results')}</Text>
        {quiz.scores.length ? (
          quiz.scores.map((s, i) => (
            <View key={s.id} style={[styles.scoreRow, s.me && styles.scoreMine]}>
              <Text style={{ width: 28, fontSize: 18 }}>{MEDALS[i] ?? `${i + 1}.`}</Text>
              <Text variant="bodyStrong" style={{ flex: 1 }} numberOfLines={1}>
                {s.me ? t('you') : (s.name ?? t('learner'))}
              </Text>
              <Text variant="small" color={Colors.textSecondary}>
                {t('quiz.right', { count: s.correct, total })}
              </Text>
              <Text style={{ fontFamily: Fonts.extrabold, minWidth: 54, textAlign: 'right' }}>
                {t('quiz.points', { count: s.points })}
              </Text>
            </View>
          ))
        ) : (
          <Text variant="small" color={Colors.textSecondary}>
            {t('quiz.noAnswers')}
          </Text>
        )}
        {xp > 0 && (
          <Text variant="bodyStrong" color={Colors.success} center>
            {t('quiz.xp', { count: xp })}
          </Text>
        )}
        <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
          {host && (
            <View style={{ flex: 1 }}>
              <Button title={t('quiz.again')} icon="refresh" onPress={onAgain} />
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Button title={t('quiz.close')} variant="secondary" onPress={onClose} />
          </View>
        </View>
      </Card>
    );
  }

  const i = st.index;
  const q = quiz.questions[i]!;
  const mine = quiz.mine[i] ?? picked[i] ?? null;
  const reveal = st.stage === 'reveal' ? quiz.reveals[i] : undefined;
  const seconds = Math.ceil(st.left / 1000);
  return (
    <Card style={styles.card}>
      {head}
      <View style={styles.head}>
        <Text variant="small" color={Colors.textSecondary} style={{ flex: 1 }}>
          {t('quiz.counter', { n: i + 1, total })}
        </Text>
        <Text
          style={{ fontFamily: Fonts.extrabold }}
          color={st.stage === 'question' && seconds <= 5 ? Colors.danger : Colors.text}>
          {st.stage === 'question' ? `${seconds}s` : t('quiz.next', { count: seconds })}
        </Text>
      </View>
      {st.stage === 'question' && <ProgressBar progress={st.left / quiz.questionMs} height={6} />}
      <Text variant="bodyStrong">{pretty(q.q)}</Text>
      {q.options.map((o, c) => {
        const right = reveal && c === reveal.answer;
        const wrong = reveal && c === mine && c !== reveal.answer;
        return (
          <Pressable
            key={c}
            onPress={() => onAnswer(i, c)}
            disabled={st.stage !== 'question' || mine !== null}
            accessibilityRole="button"
            accessibilityState={{ selected: mine === c }}
            style={[
              styles.option,
              mine === c && !reveal && styles.optionPicked,
              right && styles.optionRight,
              wrong && styles.optionWrong,
            ]}>
            <Text style={styles.letter} color={right ? Colors.success : wrong ? Colors.danger : Colors.primary}>
              {LETTERS[c]}
            </Text>
            <Text variant="body" style={{ flex: 1 }}>
              {pretty(o)}
            </Text>
            {reveal && (
              <Text variant="small" color={Colors.textSecondary}>
                <Ionicons name="person" size={11} /> {reveal.picks[c] ?? 0}
              </Text>
            )}
            {right && <Ionicons name="checkmark-circle" size={20} color={Colors.success} />}
            {wrong && <Ionicons name="close-circle" size={20} color={Colors.danger} />}
          </Pressable>
        );
      })}
      {st.stage === 'question' ? (
        <Text variant="small" color={Colors.textSecondary} center>
          {mine === null ? t('quiz.pick') : t('quiz.locked', { count: Math.max(1, quiz.answered[i] ?? 0) })}
        </Text>
      ) : reveal ? (
        <>
          <Text
            variant="bodyStrong"
            center
            color={mine === null ? Colors.textSecondary : mine === reveal.answer ? Colors.success : Colors.danger}>
            {mine === null ? t('quiz.missed') : mine === reveal.answer ? t('quiz.correct') : t('quiz.wrong')}
          </Text>
          <Text variant="small" color={Colors.textSecondary}>
            {pretty(reveal.explanation)}
          </Text>
        </>
      ) : (
        <Text variant="small" color={Colors.textSecondary} center>
          {t('quiz.checking')}
        </Text>
      )}
    </Card>
  );
}

/** The host picks the exam and subject for a quiz battle. */
export function QuizSheet({
  visible,
  roomSubject,
  busy,
  onClose,
  onStart,
}: {
  visible: boolean;
  roomSubject: string | null;
  busy: boolean;
  onClose: () => void;
  onStart: (exam: ExamId, subject: ExamSubjectId) => void;
}) {
  const { t } = useTranslation('rooms');
  const te = useTranslation('exams').t as unknown as (key: string) => string;
  const [exam, setExam] = useState<ExamId>('jamb');
  // Start on the room's subject when it matches one ("Maths" → Mathematics).
  const [subject, setSubject] = useState<ExamSubjectId>(
    () => SUBJECTS.find((s) => roomSubject?.toLowerCase().includes(s.slice(0, 4))) ?? 'mathematics',
  );
  return (
    <Sheet visible={visible} title={t('quiz.start')} onClose={onClose}>
      <Text variant="small" color={Colors.textSecondary}>
        {t('quiz.about')}
      </Text>
      <Text variant="label" color={Colors.textSecondary}>
        {t('quiz.exam')}
      </Text>
      <View style={styles.chips}>
        {EXAM_IDS.map((e) => (
          <Chip key={e} label={te(`exams.${e}.name`)} on={exam === e} onPress={() => setExam(e)} />
        ))}
      </View>
      <Text variant="label" color={Colors.textSecondary}>
        {t('quiz.subject')}
      </Text>
      <ScrollView style={{ maxHeight: 220 }}>
        <View style={styles.chips}>
          {SUBJECTS.map((s) => (
            <Chip key={s} label={te(`subjects.${s}`)} on={subject === s} onPress={() => setSubject(s)} />
          ))}
        </View>
      </ScrollView>
      <Button title={t('quiz.go')} icon="trophy" loading={busy} onPress={() => onStart(exam, subject)} />
    </Sheet>
  );
}

const styles = StyleSheet.create({
  card: { gap: Spacing.sm, borderColor: Colors.reward, borderWidth: 1.5 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  big: { fontFamily: Fonts.extrabold, fontSize: 64, lineHeight: 72, color: Colors.primary },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: 12,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  optionPicked: { borderColor: Colors.primary, backgroundColor: Colors.primarySoft },
  optionRight: { borderColor: Colors.success, backgroundColor: 'rgba(34,197,94,0.10)' },
  optionWrong: { borderColor: Colors.danger, backgroundColor: 'rgba(239,68,68,0.08)' },
  letter: { fontFamily: Fonts.extrabold, width: 18 },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: Radius.md,
  },
  scoreMine: { backgroundColor: Colors.primarySoft },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
});
