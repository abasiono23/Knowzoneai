import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, TextInput, View } from 'react-native';

import { AuthScreen } from '@/components/auth/auth-screen';
import { ChoiceChip, ChipWrap } from '@/components/personalize/choice-chip';
import { OptionCard } from '@/components/personalize/option-card';
import { Button, Text } from '@/components/ui';
import { Colors, Fonts, NoWebOutline, Radius, Spacing } from '@/constants/theme';
import { englishSubjectName, getLesson, SUBJECTS } from '@/lib/catalog';
import { subjectLabel } from '@/lib/tutor/format';
import { useMaterial } from '@/lib/studio/store';
import { useTutor } from '@/lib/tutor/store';
import { MODES, type TutorLevel, type TutorMode } from '@/lib/tutor/types';

/** Screen 49: start a conversation with a style, level and (optional) subject. */
export default function NewConversationScreen() {
  const { t } = useTranslation('tutor');
  const { createConversation, remaining } = useTutor();
  // Opened from a lesson or a study pack: the chat is about it.
  const params = useLocalSearchParams<{ lesson?: string; pack?: string }>();
  const fromLesson = getLesson(params.lesson ?? '');
  const fromPack = useMaterial(params.pack).material;
  const [mode, setMode] = useState<TutorMode>('explain');
  const [level, setLevel] = useState<TutorLevel>('beginner');
  const [subject, setSubject] = useState<string | null>(
    fromLesson ? englishSubjectName(fromLesson.subjectId) : fromPack && fromPack.subject !== 'General' ? fromPack.subject : null,
  );
  const [question, setQuestion] = useState('');

  const start = () => {
    if (remaining <= 0) return router.replace('/tutor/limit');
    const id = createConversation({
      mode,
      level,
      subject: subject ?? undefined,
      ...(fromLesson && { context: { kind: 'lesson', label: fromLesson.title, refId: fromLesson.id } }),
      ...(fromPack && { context: { kind: 'pack', label: fromPack.title, refId: fromPack.id } }),
    });
    router.replace({ pathname: '/tutor/[id]', params: question.trim() ? { id, q: question.trim() } : { id } });
  };

  return (
    <AuthScreen
      title={t('shared.newConversation')}
      subtitle={t('newChat.subtitle')}
      footer={
        <Button
          title={question.trim() ? t('shared.askTheTutor') : t('newChat.startChatting')}
          icon="sparkles"
          onPress={start}
        />
      }>
      <View style={{ gap: Spacing.sm }}>
        {MODES.map((m) => (
          <OptionCard
            key={m.id}
            label={t(`modes.${m.id}.label`)}
            description={t(`modes.${m.id}.description`)}
            icon={m.icon as keyof typeof Ionicons.glyphMap}
            selected={mode === m.id}
            onPress={() => setMode(m.id)}
          />
        ))}
      </View>

      <Text variant="heading">{t('newChat.level')}</Text>
      <ChipWrap>
        <ChoiceChip
          label={t('newChat.keepSimple')}
          emoji="🌱"
          selected={level === 'beginner'}
          onPress={() => setLevel('beginner')}
        />
        <ChoiceChip
          label={t('newChat.goDeeper')}
          emoji="🚀"
          selected={level === 'advanced'}
          onPress={() => setLevel('advanced')}
        />
      </ChipWrap>

      <Text variant="heading">{t('newChat.subject')}</Text>
      <ChipWrap>
        {SUBJECTS.slice(0, 10).map((s) => (
          <ChoiceChip
            key={s.id}
            label={subjectLabel(englishSubjectName(s.id))}
            emoji={s.emoji}
            selected={subject === englishSubjectName(s.id)}
            onPress={() => setSubject(subject === englishSubjectName(s.id) ? null : englishSubjectName(s.id))}
          />
        ))}
      </ChipWrap>

      <Text variant="heading">{t('newChat.firstQuestion')}</Text>
      <TextInput
        value={question}
        onChangeText={setQuestion}
        placeholder={t('newChat.placeholder')}
        placeholderTextColor={Colors.textMuted}
        multiline
        style={styles.input}
        accessibilityLabel={t('newChat.firstQuestionLabel')}
      />
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  input: {
    ...NoWebOutline,
    minHeight: 90,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.text,
    fontFamily: Fonts.regular,
    fontSize: 16,
    padding: Spacing.md,
    textAlignVertical: 'top',
  },
});
