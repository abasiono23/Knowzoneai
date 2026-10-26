import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { AuthScreen } from '@/components/auth/auth-screen';
import { TextField } from '@/components/auth/text-field';
import { ChoiceChip, ChipWrap } from '@/components/personalize/choice-chip';
import { ToggleRow } from '@/components/personalize/toggle-row';
import { Button, Card, Text } from '@/components/ui';
import { Colors, Fonts, Radius, Spacing, NoWebOutline } from '@/constants/theme';
import { formatNumber } from '@/i18n';
import { errorText } from '@/i18n/errors';
import { teacherApi, type ClassSummary, type NewAssignment } from '@/lib/teacher';

const COUNTS = [5, 10, 15, 20];
const DUE = [1, 3, 7, 14];
const SOURCES: ('ai' | 'text')[] = ['ai', 'text'];

export default function NewAssignmentScreen() {
  const { t } = useTranslation('teacher');
  const params = useLocalSearchParams<{ classId?: string; topic?: string }>();
  const [classes, setClasses] = useState<ClassSummary[]>([]);
  const [classId, setClassId] = useState(params.classId ?? '');
  const [topic, setTopic] = useState(params.topic ?? '');
  const [title, setTitle] = useState('');
  const [source, setSource] = useState<NewAssignment['source']>('ai');
  const [sourceText, setSourceText] = useState('');
  const [count, setCount] = useState(10);
  const [dueDays, setDueDays] = useState(3);
  const [allowRetries, setAllowRetries] = useState(true);
  const [showAnswers, setShowAnswers] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    teacherApi.classes().then((r) => {
      setClasses(r.classes);
      if (!params.classId && r.classes[0]) setClassId(r.classes[0].id);
    });
  }, [params.classId]);

  const valid = !!classId && !!topic.trim() && (source !== 'text' || sourceText.trim().length > 100);

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      const due = new Date(Date.now() + dueDays * 86_400_000);
      due.setHours(23, 59, 0, 0);
      const res = await teacherApi.createAssignment({
        classId,
        topic: topic.trim(),
        title: title.trim() || t('newAssignment.defaultTitle', { topic: topic.trim() }),
        source,
        sourceText: source === 'text' ? sourceText : undefined,
        questionCount: count,
        dueAt: due.toISOString(),
        allowRetries,
        showAnswers,
      });
      router.replace(`/assignment/${res.assignment.id}`);
    } catch (e) {
      setError(errorText(e, t('newAssignment.failed')));
      setBusy(false);
    }
  };

  return (
    <AuthScreen
      title={t('newAssignment.title')}
      subtitle={t('newAssignment.subtitle')}
      footer={
        <>
          {error && (
            <Text variant="small" color={Colors.danger} center>
              {error}
            </Text>
          )}
          <Button
            title={t('newAssignment.assign')}
            icon="paper-plane"
            onPress={submit}
            loading={busy}
            disabled={!valid}
          />
        </>
      }>
      <Text variant="heading">{t('newAssignment.class')}</Text>
      {classes.length === 0 ? (
        <Card>
          <Text color={Colors.textSecondary}>{t('newAssignment.createClassFirst')}</Text>
        </Card>
      ) : (
        <ChipWrap>
          {classes.map((c) => (
            <ChoiceChip key={c.id} label={c.name} selected={classId === c.id} onPress={() => setClassId(c.id)} />
          ))}
        </ChipWrap>
      )}

      <TextField
        label={t('newAssignment.topic')}
        icon="bulb-outline"
        placeholder={t('newAssignment.topicPlaceholder')}
        value={topic}
        onChangeText={setTopic}
      />
      <TextField
        label={t('newAssignment.titleLabel')}
        icon="text-outline"
        placeholder={topic ? t('newAssignment.defaultTitle', { topic }) : t('newAssignment.titlePlaceholder')}
        value={title}
        onChangeText={setTitle}
      />

      <Text variant="heading">{t('newAssignment.questionsFrom')}</Text>
      <View style={styles.sources}>
        {SOURCES.map((s) => (
          <Pressable
            key={s}
            onPress={() => setSource(s)}
            accessibilityRole="radio"
            accessibilityState={{ checked: source === s }}
            style={[styles.source, source === s && styles.sourceOn]}>
            <Text variant="bodyStrong">{t(`newAssignment.sources.${s}.label`)}</Text>
            <Text variant="small" color={Colors.textSecondary}>
              {t(`newAssignment.sources.${s}.description`)}
            </Text>
          </Pressable>
        ))}
      </View>
      {source === 'text' && (
        <TextInput
          value={sourceText}
          onChangeText={setSourceText}
          multiline
          placeholder={t('newAssignment.sourcePlaceholder')}
          placeholderTextColor={Colors.textMuted}
          style={styles.textArea}
          textAlignVertical="top"
        />
      )}

      <Text variant="heading">{t('newAssignment.questionCount')}</Text>
      <ChipWrap>
        {COUNTS.map((n) => (
          <ChoiceChip key={n} label={formatNumber(n)} selected={count === n} onPress={() => setCount(n)} />
        ))}
      </ChipWrap>

      <Text variant="heading">{t('newAssignment.due')}</Text>
      <ChipWrap>
        {DUE.map((d) => (
          <ChoiceChip
            key={d}
            label={
              d === 1
                ? t('newAssignment.dueOptions.tomorrow')
                : d === 7
                  ? t('newAssignment.dueOptions.week')
                  : d === 14
                    ? t('newAssignment.dueOptions.twoWeeks')
                    : t('newAssignment.dueOptions.days', { count: d })
            }
            selected={dueDays === d}
            onPress={() => setDueDays(d)}
          />
        ))}
      </ChipWrap>

      <Card style={{ gap: Spacing.xs }}>
        <ToggleRow
          icon="refresh"
          label={t('newAssignment.allowRetries')}
          description={t('newAssignment.allowRetriesHint')}
          value={allowRetries}
          onChange={setAllowRetries}
        />
        <ToggleRow
          icon="eye"
          label={t('newAssignment.showAnswers')}
          description={t('newAssignment.showAnswersHint')}
          value={showAnswers}
          onChange={setShowAnswers}
        />
      </Card>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  sources: { flexDirection: 'row', gap: Spacing.sm },
  source: {
    flex: 1,
    gap: 2,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  sourceOn: { borderColor: Colors.primary, backgroundColor: Colors.primarySoft },
  textArea: {
    minHeight: 140,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.text,
    ...NoWebOutline,
    fontFamily: Fonts.regular,
    fontSize: 15,
    padding: Spacing.md,
  },
});
