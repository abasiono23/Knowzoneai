import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { ReadyMaterial } from '@/components/materials/ready-material';
import { AnswerBlocks } from '@/components/tutor/answer-blocks';
import { Button, Card, Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';

/** Screen 72: detailed notes, section by section, collapsible. */
export default function NotesScreen() {
  const { t } = useTranslation('study');
  const [closed, setClosed] = useState<Set<number>>(new Set());
  return (
    <ReadyMaterial>
      {(m) => (
        <Screen withTabBar={false}>
          <ScreenHeader eyebrow={t('notes.eyebrow', { minutes: m.content.readingMinutes })} title={m.title} />
          <Card style={styles.contents}>
            <Text variant="label" color={Colors.textMuted}>
              {t('notes.contents')}
            </Text>
            {m.content.notes.map((n, i) => (
              <Text key={i} variant="small" color={Colors.textSecondary}>
                {t('notes.contentsItem', { number: i + 1, heading: n.heading })}
              </Text>
            ))}
          </Card>
          {m.content.notes.map((n, i) => {
            const open = !closed.has(i);
            return (
              <View key={i} style={{ gap: Spacing.sm }}>
                <Pressable
                  onPress={() =>
                    setClosed((s) => {
                      const next = new Set(s);
                      if (next.has(i)) next.delete(i);
                      else next.add(i);
                      return next;
                    })
                  }
                  accessibilityRole="button"
                  accessibilityLabel={t(open ? 'notes.collapse' : 'notes.expand', { heading: n.heading })}
                  style={styles.heading}>
                  <View style={styles.num}>
                    <Text variant="label">{i + 1}</Text>
                  </View>
                  <Text variant="title" style={{ flex: 1, fontSize: 20, lineHeight: 26 }}>
                    {n.heading}
                  </Text>
                  <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={20} color={Colors.textMuted} />
                </Pressable>
                {open && <AnswerBlocks blocks={n.blocks} />}
              </View>
            );
          })}
          <Button
            title={t('notes.testYourself')}
            icon="help-circle"
            onPress={() => router.push(`/study/${m.id}/quiz-setup`)}
          />
        </Screen>
      )}
    </ReadyMaterial>
  );
}

const styles = StyleSheet.create({
  contents: { gap: 4 },
  heading: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingTop: Spacing.sm },
  num: {
    width: 28,
    height: 28,
    borderRadius: Radius.sm,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
