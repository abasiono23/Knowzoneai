import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router, type Href } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { Text } from '@/components/ui';
import { Colors, Palette, Radius, Spacing } from '@/constants/theme';
import type { TutorAnswer } from '@/lib/tutor/types';

type Props = { conversationId: string; messageId: string; answer: TutorAnswer; exclude?: string[] };

/** What you can do with an answer: open details, steps, examples, save, flashcards, quiz. */
export function AnswerActions({ conversationId, messageId, answer, exclude = [] }: Props) {
  const { t } = useTranslation('tutor');
  const q = `?c=${conversationId}&m=${messageId}`;
  const actions: {
    id: string;
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    color: string;
    href: string;
    show: boolean;
  }[] = [
    {
      id: 'answer',
      icon: 'expand',
      label: t('actions.fullAnswer'),
      color: Palette.purple300,
      href: `/tutor/answer${q}`,
      show: true,
    },
    {
      id: 'steps',
      icon: 'footsteps',
      label: t('actions.steps'),
      color: Palette.teal400,
      href: `/tutor/steps${q}`,
      show: answer.steps.length > 0,
    },
    {
      id: 'examples',
      icon: 'color-wand',
      label: t('actions.examples'),
      color: Palette.sky400,
      href: `/tutor/examples${q}`,
      show: answer.examples.length > 0,
    },
    {
      id: 'note',
      icon: 'bookmark',
      label: t('actions.saveNote'),
      color: Palette.gold400,
      href: `/tutor/save-note${q}`,
      show: true,
    },
    {
      id: 'cards',
      icon: 'albums',
      label: t('actions.flashcards'),
      color: '#FF9F43',
      href: `/tutor/flashcards${q}`,
      show: answer.flashcards.length > 0,
    },
    {
      id: 'quiz',
      icon: 'help-circle',
      label: t('actions.quiz'),
      color: Palette.coral400,
      href: `/tutor/quiz${q}`,
      show: answer.quiz.length > 0,
    },
  ];

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: Spacing.xs }}>
      {actions
        .filter((a) => a.show && !exclude.includes(a.id))
        .map((a) => (
          <Pressable
            key={a.id}
            onPress={() => {
              Haptics.selectionAsync().catch(() => {});
              router.push(a.href as Href);
            }}
            accessibilityRole="button"
            accessibilityLabel={a.label}
            style={({ pressed }) => [styles.action, pressed && { opacity: 0.7 }]}>
            <Ionicons name={a.icon} size={15} color={a.color} />
            <Text variant="small" style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 13 }}>
              {a.label}
            </Text>
          </Pressable>
        ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 11,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
});
