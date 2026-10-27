import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { TextField } from '@/components/auth/text-field';
import { ChoiceChip, ChipWrap } from '@/components/personalize/choice-chip';
import { OptionCard } from '@/components/personalize/option-card';
import { WizardStep } from '@/components/videos/wizard-step';
import { Text } from '@/components/ui';
import { Colors, Fonts, NoWebOutline, Radius, Spacing } from '@/constants/theme';
import { LESSONS, getSubject, subjectName } from '@/lib/catalog';
import { useMaterials } from '@/lib/studio/store';
import { useVideoDraft } from '@/lib/videos/draft';
import { subjectLabel } from '@/lib/videos/options';

type Kind = 'topic' | 'material' | 'lesson' | 'text';

const SUGGESTIONS = ['photosynthesis', 'mole', 'newton', 'demand'] as const;

/** Screen 99: choose a topic or source for the video. */
export default function VideoSourceScreen() {
  const draft = useVideoDraft();
  const { materials } = useMaterials();
  const { t } = useTranslation('videos');
  const { t: tHome } = useTranslation('home');
  const lessonSubject = (id: string) => {
    const subject = getSubject(id);
    return subject && subjectName(subject, tHome);
  };
  const ready = materials.filter((m) => m.status === 'ready');
  const [kind, setKind] = useState<Kind>('topic');
  const [topic, setTopic] = useState('');
  const [materialId, setMaterialId] = useState<string | null>(ready[0]?.id ?? null);
  const [lessonId, setLessonId] = useState<string | null>(null);
  const [text, setText] = useState('');

  const valid =
    (kind === 'topic' && topic.trim().length >= 3) ||
    (kind === 'material' && !!materialId) ||
    (kind === 'lesson' && !!lessonId) ||
    (kind === 'text' && text.trim().split(/\s+/).length >= 40);

  const commit = () => {
    if (kind === 'topic')
      draft.set({
        title: topic.trim(),
        source: { kind: 'topic', topic: topic.trim() },
      });
    if (kind === 'material') {
      const m = ready.find((x) => x.id === materialId)!;
      draft.set({
        title: m.title,
        source: { kind: 'material', materialId: m.id, label: m.title },
      });
    }
    if (kind === 'lesson') {
      const l = LESSONS.find((x) => x.id === lessonId)!;
      draft.set({
        title: l.title,
        source: { kind: 'lesson', lessonId: l.id, label: l.title },
      });
    }
    if (kind === 'text') {
      const first = text
        .trim()
        .split(/(?<=[.!?])\s/)[0]
        .slice(0, 60);
      draft.set({
        title: first,
        source: { kind: 'text', text: text.trim(), label: 'Your notes' },
      });
    }
  };

  return (
    <WizardStep step={1} title={t('source.title')} next="/videos/create/length" canContinue={valid} onContinue={commit}>
      <OptionCard
        label={t('source.topic')}
        description={t('source.topicHint')}
        icon="bulb"
        selected={kind === 'topic'}
        onPress={() => setKind('topic')}
      />
      <OptionCard
        label={t('source.pack')}
        description={ready.length ? t('source.packsReady', { count: ready.length }) : t('source.packsNone')}
        icon="layers"
        selected={kind === 'material'}
        onPress={() => ready.length && setKind('material')}
      />
      <OptionCard
        label={t('source.lesson')}
        description={t('source.lessonHint')}
        icon="book"
        selected={kind === 'lesson'}
        onPress={() => setKind('lesson')}
      />
      <OptionCard
        label={t('source.notes')}
        description={t('source.notesHint')}
        icon="clipboard"
        selected={kind === 'text'}
        onPress={() => setKind('text')}
      />

      <View style={{ gap: Spacing.sm, marginTop: Spacing.sm }}>
        {kind === 'topic' && (
          <>
            <TextField
              label={t('source.topicLabel')}
              icon="bulb-outline"
              placeholder={t('source.topicPlaceholder')}
              value={topic}
              onChangeText={setTopic}
            />
            <ChipWrap>
              {SUGGESTIONS.map((id) => {
                const label = t(`source.suggestions.${id}`);
                return <ChoiceChip key={id} label={label} selected={topic === label} onPress={() => setTopic(label)} />;
              })}
            </ChipWrap>
          </>
        )}
        {kind === 'material' &&
          ready.map((m) => (
            <OptionCard
              key={m.id}
              label={m.title}
              description={`${subjectLabel(m.subject, t, tHome)} · ${t('source.concepts', { count: m.content?.concepts.length ?? 0 })}`}
              emoji="📚"
              selected={materialId === m.id}
              onPress={() => setMaterialId(m.id)}
            />
          ))}
        {kind === 'lesson' && (
          <ScrollView style={{ maxHeight: 320 }} nestedScrollEnabled>
            <View style={{ gap: Spacing.xs }}>
              {LESSONS.map((l) => (
                <OptionCard
                  key={l.id}
                  label={l.title}
                  description={lessonSubject(l.subjectId)}
                  emoji={getSubject(l.subjectId)?.emoji}
                  selected={lessonId === l.id}
                  onPress={() => setLessonId(l.id)}
                />
              ))}
            </View>
          </ScrollView>
        )}
        {kind === 'text' && (
          <>
            <TextInput
              value={text}
              onChangeText={setText}
              multiline
              placeholder={t('source.notesPlaceholder')}
              placeholderTextColor={Colors.textMuted}
              style={styles.area}
              accessibilityLabel={t('source.notesLabel')}
            />
            <Text variant="small" color={Colors.textMuted}>
              {t('source.words', { count: text.trim() ? text.trim().split(/\s+/).length : 0 })}
            </Text>
          </>
        )}
      </View>
    </WizardStep>
  );
}

const styles = StyleSheet.create({
  area: {
    ...NoWebOutline,
    minHeight: 160,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.text,
    fontFamily: Fonts.regular,
    fontSize: 15,
    padding: Spacing.md,
    textAlignVertical: 'top',
  },
});
