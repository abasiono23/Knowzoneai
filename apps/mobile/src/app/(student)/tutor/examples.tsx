import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { ChoiceChip } from '@/components/personalize/choice-chip';
import { TutorErrorState } from '@/components/tutor/error-state';
import { Button, Card, Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Palette, Radius, Spacing } from '@/constants/theme';
import { subjectLabel } from '@/lib/tutor/format';
import { useAnswer, useTutor } from '@/lib/tutor/store';
import type { Example } from '@/lib/tutor/types';

const LEVEL_COLOR: Record<Example['level'], string> = {
  Easy: Palette.teal400,
  Medium: Palette.gold400,
  Hard: Palette.coral400,
  'Real life': Palette.sky400,
};

/** Screen 55: worked examples at rising difficulty plus real-life ones; answers hidden until tapped. */
export default function ExamplesScreen() {
  const { t } = useTranslation('tutor');
  const { c, m } = useLocalSearchParams<{ c: string; m: string }>();
  const { conv, answer } = useAnswer(c, m);
  const { send } = useTutor();
  const [level, setLevel] = useState<Example['level'] | null>(null);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());

  if (!conv || !answer) {
    return (
      <Screen withTabBar={false}>
        <ScreenHeader />
        <TutorErrorState kind="missing" title={t('examples.notFound')} onBack={() => router.back()} />
      </Screen>
    );
  }

  const levels = [...new Set(answer.examples.map((e) => e.level))];
  const list = answer.examples.map((e, i) => ({ e, i })).filter(({ e }) => !level || e.level === level);

  const more = async () => {
    const r = await send(conv.id, t('examples.morePrompt'));
    if (r === 'limit') router.push('/tutor/limit');
    else router.back();
  };

  return (
    <Screen withTabBar={false}>
      <ScreenHeader eyebrow={t('examples.eyebrow')} eyebrowColor={Colors.info} title={subjectLabel(answer.subject)} />
      <Text color={Colors.textSecondary}>{t('examples.intro')}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: Spacing.xs }}>
        <ChoiceChip label={t('shared.all')} selected={!level} onPress={() => setLevel(null)} />
        {levels.map((l) => (
          <ChoiceChip
            key={l}
            label={t(`exampleLevels.${l}`, { defaultValue: l })}
            selected={level === l}
            onPress={() => setLevel(level === l ? null : l)}
          />
        ))}
      </ScrollView>

      {list.map(({ e, i }, n) => {
        const open = revealed.has(i);
        return (
          <Animated.View key={e.title} entering={FadeInDown.delay(n * 60)}>
            <Card style={{ gap: Spacing.sm }}>
              <View style={styles.rowBetween}>
                <View style={[styles.level, { backgroundColor: LEVEL_COLOR[e.level] + '22' }]}>
                  <Text variant="label" color={LEVEL_COLOR[e.level]} style={{ fontSize: 10 }}>
                    {t(`exampleLevels.${e.level}`, { defaultValue: e.level }).toUpperCase()}
                  </Text>
                </View>
                <Text variant="small" color={Colors.textMuted}>
                  {t('examples.number', { number: i + 1 })}
                </Text>
              </View>
              <Text variant="bodyStrong">{e.title}</Text>
              <Text>{e.scenario}</Text>
              {open ? (
                <View style={styles.solution}>
                  <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
                  <Text style={{ flex: 1 }}>{e.explanation}</Text>
                </View>
              ) : (
                <Pressable
                  onPress={() => setRevealed((s) => new Set(s).add(i))}
                  accessibilityRole="button"
                  accessibilityLabel={t('examples.showAnswerLabel', { number: i + 1 })}
                  style={styles.reveal}>
                  <Ionicons name="eye" size={16} color={Colors.primary} />
                  <Text variant="small" color={Colors.primary}>
                    {t('examples.showAnswer')}
                  </Text>
                </Pressable>
              )}
            </Card>
          </Animated.View>
        );
      })}

      <Button title={t('examples.generateMore')} icon="sparkles" onPress={more} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  level: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.pill },
  solution: {
    flexDirection: 'row',
    gap: Spacing.xs,
    padding: Spacing.sm,
    borderRadius: Radius.sm,
    backgroundColor: Colors.successSoft,
  },
  reveal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: Radius.pill,
    backgroundColor: Colors.primarySoft,
  },
});
