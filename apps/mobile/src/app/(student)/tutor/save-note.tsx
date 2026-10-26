import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AuthScreen } from '@/components/auth/auth-screen';
import { TextField } from '@/components/auth/text-field';
import { SuccessBadge } from '@/components/onboarding/success-badge';
import { ChoiceChip, ChipWrap } from '@/components/personalize/choice-chip';
import { AnswerBlocks } from '@/components/tutor/answer-blocks';
import { TutorErrorState } from '@/components/tutor/error-state';
import { Button, Card, Text } from '@/components/ui';
import { Colors, Gradients, Spacing } from '@/constants/theme';
import { conversationTitle, notebookLabel } from '@/lib/tutor/format';
import { useAnswer, useTutor } from '@/lib/tutor/store';

/** Screen 57: save a tutor answer to notes, choosing notebook, title and what to include. */
export default function SaveNoteScreen() {
  const { t } = useTranslation('tutor');
  const { c, m } = useLocalSearchParams<{ c: string; m: string }>();
  const { conv, answer, question } = useAnswer(c, m);
  const { saveNote, notes } = useTutor();
  const notebooks = [...new Set([answer?.subject ?? 'General', ...notes.map((n) => n.notebook), 'Exam revision'])];
  const [title, setTitle] = useState(
    question?.text ? question.text.slice(0, 60) : conv ? conversationTitle(conv.title) : t('shared.tutorNote'),
  );
  const [notebook, setNotebook] = useState(notebooks[0]);
  const [include, setInclude] = useState({ explanation: true, terms: true, mistakes: true });
  const [saved, setSaved] = useState(false);

  if (!conv || !answer) {
    return (
      <AuthScreen>
        <TutorErrorState kind="missing" title={t('saveNote.nothing')} onBack={() => router.back()} />
      </AuthScreen>
    );
  }

  const body = [
    ...(include.explanation ? answer.body : []),
    ...(include.terms && answer.keyTerms.length
      ? [
          { type: 'h' as const, text: t('shared.keyTerms') },
          {
            type: 'list' as const,
            items: answer.keyTerms.map((k) => t('saveNote.termLine', { term: k.term, meaning: k.meaning })),
          },
        ]
      : []),
    ...(include.mistakes && answer.commonMistakes.length
      ? [
          { type: 'h' as const, text: t('shared.mistakesToAvoid') },
          { type: 'list' as const, items: answer.commonMistakes },
        ]
      : []),
    ...(answer.finalAnswer
      ? [{ type: 'tip' as const, text: t('saveNote.answerTip', { answer: answer.finalAnswer }) }]
      : []),
  ];

  const save = () => {
    saveNote({
      title: title.trim() || t('shared.tutorNote'),
      notebook,
      tags: [answer.subject],
      summary: answer.summary,
      body,
      source: t('saveNote.source', { title: conversationTitle(conv.title) }),
    });
    setSaved(true);
  };

  if (saved) {
    return (
      <AuthScreen
        center
        back={false}
        backdrop="reward"
        footer={
          <>
            <Button title={t('saveNote.viewNotes')} icon="bookmark" onPress={() => router.replace('/tutor/notes')} />
            <Button variant="ghost" title={t('shared.backToChat')} onPress={() => router.back()} />
          </>
        }>
        <SuccessBadge icon="bookmark" colors={Gradients.reward} />
        <Animated.View entering={FadeInDown.delay(200)} style={{ gap: Spacing.xs }}>
          <Text variant="display" center>
            {t('saveNote.savedTo', { notebook: notebookLabel(notebook) })}
          </Text>
          <Text color={Colors.textSecondary} center>
            {t('saveNote.savedBody')}
          </Text>
        </Animated.View>
      </AuthScreen>
    );
  }

  return (
    <AuthScreen
      title={t('saveNote.title')}
      subtitle={t('saveNote.subtitle')}
      footer={<Button title={t('saveNote.saveNote')} icon="bookmark" onPress={save} />}>
      <TextField label={t('saveNote.titleField')} icon="text-outline" value={title} onChangeText={setTitle} />
      <Text variant="heading">{t('saveNote.notebook')}</Text>
      <ChipWrap>
        {notebooks.map((n) => (
          <ChoiceChip key={n} label={notebookLabel(n)} selected={notebook === n} onPress={() => setNotebook(n)} />
        ))}
      </ChipWrap>
      <Text variant="heading">{t('saveNote.include')}</Text>
      <ChipWrap>
        <ChoiceChip
          label={t('saveNote.explanation')}
          selected={include.explanation}
          onPress={() => setInclude((i) => ({ ...i, explanation: !i.explanation }))}
        />
        <ChoiceChip
          label={t('shared.keyTerms')}
          selected={include.terms}
          onPress={() => setInclude((i) => ({ ...i, terms: !i.terms }))}
        />
        <ChoiceChip
          label={t('shared.mistakesToAvoid')}
          selected={include.mistakes}
          onPress={() => setInclude((i) => ({ ...i, mistakes: !i.mistakes }))}
        />
      </ChipWrap>
      <Text variant="heading">{t('saveNote.preview')}</Text>
      <Card style={{ gap: Spacing.sm }}>
        <View style={styles.previewHead}>
          <Ionicons name="document-text" size={16} color={Colors.reward} />
          <Text variant="bodyStrong" style={{ flex: 1 }} numberOfLines={1}>
            {title || t('shared.tutorNote')}
          </Text>
        </View>
        <Text variant="small" color={Colors.textSecondary}>
          {answer.summary}
        </Text>
        <AnswerBlocks blocks={body.slice(0, 4)} />
        {body.length > 4 && (
          <Text variant="small" color={Colors.textMuted}>
            {t('saveNote.moreSections', { count: body.length - 4 })}
          </Text>
        )}
      </Card>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  previewHead: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
});
