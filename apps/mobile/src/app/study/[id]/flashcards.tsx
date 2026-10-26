import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { ReadyMaterial } from '@/components/materials/ready-material';
import { Button, Card, ProgressBar, Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { dueCards } from '@/lib/studio/store';

// Labels live in the `study` namespace under flashcards.boxes.
const BOX_LABEL = ['new', 'learning', 'learning', 'known', 'mastered'] as const;
const BOX_COLOR = [Colors.textMuted, Colors.danger, Colors.reward, Colors.success, Colors.success];

/** Screen 75: the flashcard deck, with each card's status and a button into study mode. */
export default function FlashcardsScreen() {
  const { t } = useTranslation('study');
  const [flipped, setFlipped] = useState<Set<string>>(new Set());
  return (
    <ReadyMaterial>
      {(m) => {
        const { due, total, mastered } = dueCards(m);
        return (
          <Screen withTabBar={false}>
            <ScreenHeader eyebrow={t('flashcards.eyebrow', { count: total })} eyebrowColor="#FF9F43" title={m.title} />
            <Card style={{ gap: Spacing.xs }}>
              <View style={styles.rowBetween}>
                <Text variant="small" color={Colors.textSecondary}>
                  {t('flashcards.mastered', { mastered, total })}
                </Text>
                <Text variant="small" color={due.length ? Colors.reward : Colors.success}>
                  {due.length ? t('flashcards.dueNow', { count: due.length }) : t('flashcards.caughtUp')}
                </Text>
              </View>
              <ProgressBar progress={total ? mastered / total : 0} height={8} />
            </Card>
            <Button
              title={due.length ? t('flashcards.studyDue', { count: due.length }) : t('flashcards.practiseAll')}
              icon="play"
              onPress={() => router.push(`/study/${m.id}/study`)}
            />
            <Text variant="small" color={Colors.textMuted}>
              {t('flashcards.tapHint')}
            </Text>
            {m.content.flashcards.map((c, i) => {
              const box = m.cards[c.id]?.box ?? 0;
              const open = flipped.has(c.id);
              return (
                <Pressable
                  key={c.id}
                  onPress={() =>
                    setFlipped((s) => {
                      const next = new Set(s);
                      if (next.has(c.id)) next.delete(c.id);
                      else next.add(c.id);
                      return next;
                    })
                  }
                  accessibilityRole="button"
                  accessibilityLabel={t('flashcards.cardA11y', { number: i + 1, front: c.front })}>
                  <Card style={[styles.card, open && { borderColor: Colors.success + '77' }]}>
                    <View style={styles.rowBetween}>
                      <Text variant="label" color={Colors.textMuted}>
                        {t('flashcards.cardLabel', { number: i + 1 })}
                      </Text>
                      <View style={[styles.status, { backgroundColor: BOX_COLOR[box] + '22' }]}>
                        <Text variant="label" color={BOX_COLOR[box]} style={{ fontSize: 10 }}>
                          {t(`flashcards.boxes.${BOX_LABEL[box]}`)}
                        </Text>
                      </View>
                    </View>
                    <Text variant="bodyStrong">{c.front}</Text>
                    {open ? (
                      <Text color={Colors.success}>{c.back}</Text>
                    ) : (
                      <View style={styles.hint}>
                        <Ionicons name="eye-outline" size={14} color={Colors.textMuted} />
                        <Text variant="small" color={Colors.textMuted}>
                          {t('flashcards.reveal')}
                        </Text>
                      </View>
                    )}
                  </Card>
                </Pressable>
              );
            })}
          </Screen>
        );
      }}
    </ReadyMaterial>
  );
}

const styles = StyleSheet.create({
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  card: { gap: Spacing.xs },
  status: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.pill },
  hint: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});
