import { router } from 'expo-router';
import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { ResultHero } from '@/components/billing/billing-ui';
import { TextArea } from '@/components/help/help-ui';
import { Button, Chip, Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Gradients, Radius, Spacing } from '@/constants/theme';
import { errorText } from '@/i18n/errors';
import { api } from '@/lib/api';
import { goBack } from '@/lib/navigation';

// Labels are translated at render time (feedback.moods.<value>, feedback.areas.<id>).
const MOODS = [
  { value: 1, emoji: '😞' },
  { value: 2, emoji: '😕' },
  { value: 3, emoji: '😐' },
  { value: 4, emoji: '🙂' },
  { value: 5, emoji: '🤩' },
] as const;
type AreaId = 'tutor' | 'packs' | 'videos' | 'courses' | 'world' | 'rewards' | 'design' | 'new';
/** `value` is what the support team receives, so it stays in English. */
const AREAS: { id: AreaId; value: string }[] = [
  { id: 'tutor', value: 'AI tutor' },
  { id: 'packs', value: 'Study packs' },
  { id: 'videos', value: 'Videos' },
  { id: 'courses', value: 'Courses' },
  { id: 'world', value: 'Knowzone World' },
  { id: 'rewards', value: 'Rewards' },
  { id: 'design', value: 'Design' },
  { id: 'new', value: 'Something new' },
];

/** Screen 223: submit feedback. A rating, what it’s about and an idea. */
export default function FeedbackScreen() {
  const { t } = useTranslation('help');
  const [rating, setRating] = useState<number | null>(null);
  const [areas, setAreas] = useState<string[]>([]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const send = async () => {
    setBusy(true);
    setError(null);
    try {
      await api.createTicket({
        kind: 'feedback',
        subject: areas.length ? `Feedback: ${areas.join(', ')}` : 'Feedback',
        message: text.trim(),
        meta: { rating: `${rating}/5 ${MOODS.find((m) => m.value === rating)?.emoji ?? ''}`, area: areas.join(', ') },
      });
      setSent(true);
    } catch (e) {
      setError(errorText(e, t('feedback.sendError')));
    } finally {
      setBusy(false);
    }
  };

  if (sent)
    return (
      <Screen withTabBar={false}>
        <ResultHero
          icon="heart"
          colors={Gradients.reward}
          title={t('feedback.thanksTitle')}
          body={t('feedback.thanksBody')}
        />
        <Button title={t('actions.done', { ns: 'common' })} onPress={() => goBack('/help')} />
        <Button variant="ghost" title={t('feedback.seeRequests')} onPress={() => router.replace('/help/tickets')} />
      </Screen>
    );

  return (
    <Screen withTabBar={false}>
      <ScreenHeader eyebrow={t('ui.eyebrow')} title={t('feedback.title')} />
      <Text variant="heading">{t('feedback.feelQuestion')}</Text>
      <View style={styles.moods} accessibilityRole="radiogroup">
        {MOODS.map((m) => {
          const on = rating === m.value;
          return (
            <Pressable
              key={m.value}
              onPress={() => setRating(m.value)}
              accessibilityRole="radio"
              accessibilityState={{ selected: on }}
              accessibilityLabel={t(`feedback.moods.${m.value}`)}
              style={[styles.mood, on && styles.moodOn]}>
              <Text style={{ fontSize: on ? 34 : 28 }}>{m.emoji}</Text>
            </Pressable>
          );
        })}
      </View>
      {!!rating && (
        <Text variant="small" color={Colors.textSecondary} center>
          {t(`feedback.moods.${rating as (typeof MOODS)[number]['value']}`)}
        </Text>
      )}

      <View style={{ gap: Spacing.xs }}>
        <Text variant="bodyStrong" style={{ fontSize: 14 }}>
          {t('feedback.aboutQuestion')}
        </Text>
        <View style={styles.chips}>
          {AREAS.map(({ id, value: a }) => (
            <Chip
              key={id}
              label={t(`feedback.areas.${id}`)}
              selected={areas.includes(a)}
              onPress={() => setAreas(areas.includes(a) ? areas.filter((x) => x !== a) : [...areas, a])}
            />
          ))}
        </View>
      </View>

      <TextArea
        label={t('feedback.label')}
        value={text}
        onChangeText={setText}
        placeholder={rating && rating <= 2 ? t('feedback.placeholderUnhappy') : t('feedback.placeholderHappy')}
        minHeight={130}
      />
      {error && (
        <Text variant="small" color={Colors.danger}>
          {error}
        </Text>
      )}
      <Button
        title={t('feedback.send')}
        icon="send"
        loading={busy}
        disabled={!rating || text.trim().length < 10}
        onPress={send}
      />
      <Text variant="small" color={Colors.textMuted} center style={{ fontSize: 12 }}>
        <Trans
          t={t}
          i18nKey="feedback.bugFooter"
          components={{
            link: (
              <Text
                variant="small"
                color={Colors.primary}
                style={{ fontSize: 12 }}
                onPress={() => router.replace('/help/bug')}
              />
            ),
          }}
        />
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  moods: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.xs },
  mood: {
    flex: 1,
    aspectRatio: 1,
    maxWidth: 72,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodOn: { borderColor: Colors.reward, backgroundColor: Colors.rewardSoft },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
});
