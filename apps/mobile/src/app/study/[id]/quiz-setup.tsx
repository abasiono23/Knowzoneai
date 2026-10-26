import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { AuthScreen } from '@/components/auth/auth-screen';
import { HeroIcon } from '@/components/auth/hero-icon';
import { ReadyMaterial } from '@/components/materials/ready-material';
import { ChoiceChip, ChipWrap } from '@/components/personalize/choice-chip';
import { ToggleRow } from '@/components/personalize/toggle-row';
import { Button, Card, Text } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { formatNumber } from '@/i18n';
import { toggleIn } from '@/lib/personalization';
import { quizDifficultyLabel, quizTypeLabel } from '@/lib/studio/labels';
import { pickQuestions, SECONDS_PER_QUESTION, toParams } from '@/lib/studio/quiz';
import { DEFAULT_QUIZ } from '@/lib/studio/store';
import type { QuizSettings } from '@/lib/studio/types';

/** Screen 77: quiz generator: how many questions, how hard, which types, timed or not. */
export default function QuizSetupScreen() {
  const { t } = useTranslation('study');
  const [s, setS] = useState<QuizSettings>(DEFAULT_QUIZ);
  return (
    <ReadyMaterial>
      {(m) => {
        const available = pickQuestions(m.content.quiz, { ...s, count: 999 }, 1).length;
        const count = Math.min(s.count, available);
        const generate = () => {
          const seed = Date.now() % 100_000;
          router.push({ pathname: '/study/[id]/quiz', params: { id: m.id, ...toParams({ ...s, count }, seed) } });
        };
        return (
          <AuthScreen
            hero={<HeroIcon icon="help-circle" colors={['#FF5A7A', '#7C5CFF']} />}
            title={t('quizSetup.title')}
            subtitle={t('quizSetup.subtitle', { title: m.title })}
            footer={
              <Button
                title={t('quizSetup.generate', { count })}
                icon="sparkles"
                onPress={generate}
                disabled={count === 0 || s.types.length === 0}
              />
            }>
            <Text variant="heading">{t('shared.questions')}</Text>
            <ChipWrap>
              {[5, 10, 15, 20].map((n) => (
                <ChoiceChip
                  key={n}
                  label={formatNumber(n)}
                  selected={s.count === n}
                  onPress={() => setS({ ...s, count: n })}
                />
              ))}
            </ChipWrap>
            <Text variant="heading">{t('quizSetup.difficulty')}</Text>
            <ChipWrap>
              {(['mixed', 'easy', 'hard'] as const).map((d) => (
                <ChoiceChip
                  key={d}
                  label={quizDifficultyLabel(d, t)}
                  selected={s.difficulty === d}
                  onPress={() => setS({ ...s, difficulty: d })}
                />
              ))}
            </ChipWrap>
            <Text variant="heading">{t('quizSetup.types')}</Text>
            <ChipWrap>
              <ChoiceChip
                label={quizTypeLabel('mcq', t)}
                selected={s.types.includes('mcq')}
                onPress={() => setS({ ...s, types: toggleIn(s.types, 'mcq') })}
              />
              <ChoiceChip
                label={quizTypeLabel('tf', t)}
                selected={s.types.includes('tf')}
                onPress={() => setS({ ...s, types: toggleIn(s.types, 'tf') })}
              />
            </ChipWrap>
            <Card>
              <ToggleRow
                icon="timer"
                label={t('quizSetup.timed')}
                description={t('quizSetup.timedHint', { seconds: SECONDS_PER_QUESTION })}
                value={s.timed}
                onChange={(timed) => setS({ ...s, timed })}
              />
            </Card>
            {available < s.count && (
              <View style={{ flexDirection: 'row', gap: Spacing.xs, alignItems: 'flex-start' }}>
                <Ionicons name="information-circle" size={18} color={Colors.info} />
                <Text variant="small" color={Colors.textSecondary} style={{ flex: 1 }}>
                  {t('quizSetup.fewer', { count: available })}
                </Text>
              </View>
            )}
          </AuthScreen>
        );
      }}
    </ReadyMaterial>
  );
}
