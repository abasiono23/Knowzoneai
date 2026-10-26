import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AuthScreen } from '@/components/auth/auth-screen';
import { TextField } from '@/components/auth/text-field';
import { SuccessBadge } from '@/components/onboarding/success-badge';
import { TutorErrorState } from '@/components/tutor/error-state';
import { MakingState, useMadeFromAnswer } from '@/components/tutor/making';
import { Button, Card, Text } from '@/components/ui';
import { Colors, Fonts, Gradients, NoWebOutline, Radius, Spacing } from '@/constants/theme';
import { useIsRtl } from '@/i18n/provider';
import { useAnswer, useTutor } from '@/lib/tutor/store';
import type { Flashcard } from '@/lib/tutor/types';

/** Screen 58: turn an answer into an editable flashcard deck. */
export default function ToFlashcardsScreen() {
  const { t } = useTranslation('tutor');
  const rtl = useIsRtl();
  const { c, m } = useLocalSearchParams<{ c: string; m: string }>();
  const { conv, answer } = useAnswer(c, m);
  const { saveDeck } = useTutor();
  const made = useMadeFromAnswer('flashcards', c, m, !!answer?.flashcards.length);
  const [cards, setCards] = useState<Flashcard[]>(answer?.flashcards ?? []);
  // Cards the tutor made after this screen opened become the editable list.
  const [seeded, setSeeded] = useState(!!answer?.flashcards.length);
  if (!seeded && answer?.flashcards.length) {
    setSeeded(true);
    setCards(answer.flashcards);
  }
  const [name, setName] = useState(conv ? `${conv.title.slice(0, 40)}` : t('shared.tutorDeck'));
  const [preview, setPreview] = useState<{ i: number; flipped: boolean }>({ i: 0, flipped: false });
  const [saved, setSaved] = useState(false);

  if (!conv || !answer) {
    return (
      <AuthScreen>
        <TutorErrorState kind="missing" title={t('flashcards.nothing')} onBack={() => router.back()} />
      </AuthScreen>
    );
  }

  if (made.making || made.failed) {
    return (
      <AuthScreen>
        <MakingState kind="flashcards" failed={made.failed} onRetry={made.retry} onBack={() => router.back()} />
      </AuthScreen>
    );
  }

  const update = (i: number, patch: Partial<Flashcard>) =>
    setCards((cs) => cs.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const valid = cards.filter((x) => x.front.trim() && x.back.trim());
  const p = cards[Math.min(preview.i, cards.length - 1)];

  if (saved) {
    return (
      <AuthScreen
        center
        back={false}
        backdrop="reward"
        footer={
          <>
            <Button title={t('flashcards.reviewNow')} icon="albums" onPress={() => setSaved(false)} />
            <Button variant="ghost" title={t('shared.backToChat')} onPress={() => router.back()} />
          </>
        }>
        <SuccessBadge icon="albums" colors={['#FF9F43', '#FFC857']} />
        <Animated.View entering={FadeInDown.delay(200)} style={{ gap: Spacing.xs }}>
          <Text variant="display" center>
            {t('flashcards.added', { count: valid.length })}
          </Text>
          <Text color={Colors.textSecondary} center>
            {t('flashcards.addedBody', { name })}
          </Text>
        </Animated.View>
      </AuthScreen>
    );
  }

  return (
    <AuthScreen
      title={t('flashcards.title')}
      subtitle={t('flashcards.subtitle')}
      footer={
        <Button
          title={t('flashcards.save', { count: valid.length })}
          icon="albums"
          disabled={!valid.length}
          onPress={() => {
            saveDeck({ name: name.trim() || t('shared.tutorDeck'), subject: answer.subject, cards: valid });
            setSaved(true);
          }}
        />
      }>
      {p && (
        <Pressable
          onPress={() => setPreview((s) => ({ ...s, flipped: !s.flipped }))}
          accessibilityRole="button"
          accessibilityHint={t('flashcards.flip')}>
          <LinearGradient
            colors={preview.flipped ? Gradients.mastery : Gradients.ai}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.card}>
            <Text variant="label" color="rgba(255,255,255,0.8)">
              {t(preview.flipped ? 'flashcards.previewAnswer' : 'flashcards.previewQuestion', {
                current: Math.min(preview.i, cards.length - 1) + 1,
                total: cards.length,
              })}
            </Text>
            <Text variant="heading" center>
              {preview.flipped ? p.back : p.front}
            </Text>
            <Text variant="small" color="rgba(255,255,255,0.8)">
              {t('flashcards.tapToFlip')}
            </Text>
          </LinearGradient>
        </Pressable>
      )}
      {cards.length > 1 && (
        <View style={styles.nav}>
          <Button
            variant="ghost"
            // Button doesn't mirror icons, so pick the arrow that points back in this direction.
            icon={rtl ? 'chevron-forward' : 'chevron-back'}
            title={t('flashcards.prev')}
            onPress={() => setPreview((s) => ({ i: Math.max(0, s.i - 1), flipped: false }))}
          />
          <Button
            variant="ghost"
            title={t('actions.next', { ns: 'common' })}
            icon={rtl ? 'chevron-back' : 'chevron-forward'}
            onPress={() => setPreview((s) => ({ i: Math.min(cards.length - 1, s.i + 1), flipped: false }))}
          />
        </View>
      )}

      <TextField label={t('flashcards.deckName')} icon="albums-outline" value={name} onChangeText={setName} />

      {cards.map((card, i) => (
        <Card key={i} style={{ gap: Spacing.xs }}>
          <View style={styles.cardHead}>
            <Text variant="label" color={Colors.textMuted}>
              {t('flashcards.card', { number: i + 1 })}
            </Text>
            <Pressable
              onPress={() => setCards((cs) => cs.filter((_, j) => j !== i))}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={t('flashcards.removeCard', { number: i + 1 })}>
              <Ionicons name="trash-outline" size={18} color={Colors.danger} />
            </Pressable>
          </View>
          <TextInput
            value={card.front}
            onChangeText={(v) => update(i, { front: v })}
            multiline
            style={styles.input}
            placeholder={t('flashcards.question')}
            placeholderTextColor={Colors.textMuted}
          />
          <TextInput
            value={card.back}
            onChangeText={(v) => update(i, { back: v })}
            multiline
            style={[styles.input, styles.back]}
            placeholder={t('flashcards.answer')}
            placeholderTextColor={Colors.textMuted}
          />
        </Card>
      ))}
      <Button
        variant="secondary"
        icon="add"
        title={t('flashcards.addCard')}
        onPress={() => setCards((cs) => [...cs, { front: '', back: '' }])}
      />
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 180,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  nav: { flexDirection: 'row', justifyContent: 'space-between' },
  cardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  input: {
    ...NoWebOutline,
    backgroundColor: Colors.surfaceRaised,
    borderRadius: Radius.sm,
    color: Colors.text,
    fontFamily: Fonts.semibold,
    fontSize: 15,
    padding: Spacing.sm,
  },
  back: { fontFamily: Fonts.regular, color: Colors.textSecondary },
});
