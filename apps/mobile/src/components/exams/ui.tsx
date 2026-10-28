import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { Button, Card, Text } from '@/components/ui';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { LETTERS, pretty, type ExamQuestion } from '@/lib/exams';

/** Shared pieces of the Past Questions screens. */
export function Loading() {
  return (
    <View style={{ paddingVertical: 80, alignItems: 'center' }}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
}

export function LoadError({ text, onRetry }: { text: string; onRetry: () => void }) {
  const { t } = useTranslation('exams');
  return (
    <Card style={{ gap: Spacing.sm, alignItems: 'center' }}>
      <Ionicons name="cloud-offline" size={28} color={Colors.textMuted} />
      <Text variant="body" center color={Colors.textSecondary}>
        {text}
      </Text>
      <Button title={t('retry')} variant="secondary" icon="refresh" onPress={onRetry} />
    </Card>
  );
}

/** A comprehension passage or unseen poem, shown above its questions. */
export function Passage({ text }: { text: string }) {
  const { t } = useTranslation('exams');
  return (
    <View style={styles.passage}>
      <Text variant="label" color={Colors.info}>
        {t('study.passage')}
      </Text>
      <Text variant="body" style={{ lineHeight: 22 }}>
        {pretty(text)}
      </Text>
    </View>
  );
}

export type OptionState = 'idle' | 'picked' | 'right' | 'wrong';

/** One answer option: its letter and text. */
export function OptionRow({
  index,
  text,
  state,
  onPress,
  disabled,
}: {
  index: number;
  text: string;
  state: OptionState;
  onPress?: () => void;
  disabled?: boolean;
}) {
  const color =
    state === 'right'
      ? Colors.success
      : state === 'wrong'
        ? Colors.danger
        : state === 'picked'
          ? Colors.primary
          : Colors.border;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || !onPress}
      accessibilityRole="radio"
      accessibilityState={{ checked: state === 'picked' || state === 'right', disabled }}
      accessibilityLabel={`${LETTERS[index]}. ${pretty(text)}`}
      style={({ pressed }) => [
        styles.option,
        { borderColor: color },
        state !== 'idle' && { backgroundColor: `${color}22` },
        pressed && { opacity: 0.85 },
      ]}>
      <View style={[styles.letter, { backgroundColor: state === 'idle' ? Colors.surfaceRaised : color }]}>
        <Text style={{ fontFamily: Fonts.bold, color: state === 'idle' ? Colors.textSecondary : '#fff' }}>
          {LETTERS[index]}
        </Text>
      </View>
      <Text variant="body" style={{ flex: 1 }}>
        {pretty(text)}
      </Text>
      {state === 'right' && <Ionicons name="checkmark-circle" size={20} color={Colors.success} />}
      {state === 'wrong' && <Ionicons name="close-circle" size={20} color={Colors.danger} />}
    </Pressable>
  );
}

/** The question number, topic and text. */
export function QuestionHead({ q, label }: { q: ExamQuestion; label?: string }) {
  return (
    <View style={{ gap: 6 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, flexWrap: 'wrap' }}>
        {!!label && (
          <Text variant="label" color={Colors.primary}>
            {label}
          </Text>
        )}
        <View style={styles.topic}>
          <Text variant="small" color={Colors.textSecondary}>
            {q.topic}
          </Text>
        </View>
      </View>
      <Text variant="bodyStrong" style={{ fontSize: 17, lineHeight: 24 }}>
        {pretty(q.q)}
      </Text>
    </View>
  );
}

/** Why an answer is right. */
export function Explanation({ text, title }: { text: string; title: string }) {
  return (
    <View style={styles.why}>
      <Text variant="label" color={Colors.success}>
        {title}
      </Text>
      <Text variant="body" style={{ lineHeight: 21 }}>
        {pretty(text)}
      </Text>
    </View>
  );
}

export const examStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
});

const styles = StyleSheet.create({
  passage: {
    gap: 6,
    padding: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: 'rgba(76, 201, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(76, 201, 255, 0.25)',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    backgroundColor: Colors.surface,
  },
  letter: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  topic: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: Radius.pill, backgroundColor: Colors.surfaceRaised },
  why: { gap: 4, padding: Spacing.sm, borderRadius: Radius.md, backgroundColor: Colors.successSoft },
});
