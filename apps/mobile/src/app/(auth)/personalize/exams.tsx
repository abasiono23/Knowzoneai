import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { ChoiceChip, ChipWrap } from '@/components/personalize/choice-chip';
import { OptionCard } from '@/components/personalize/option-card';
import { StepScreen } from '@/components/personalize/step-screen';
import { Text } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { EXAMS, NO_EXAM, toggleIn, upcomingMonths, learnerKey } from '@/lib/personalization';
import { usePersonalization } from '@/lib/personalization-store';

export default function ExamsScreen() {
  const { profile, update } = usePersonalization();
  const { t } = useTranslation('personalize');
  const exams = EXAMS[learnerKey(profile.learnerType)];
  const noExam = profile.examGoals.includes(NO_EXAM);
  const hasExam = profile.examGoals.length > 0 && !noExam;

  return (
    <StepScreen
      step="exams"
      title={t('exams.title')}
      subtitle={t('exams.subtitle')}
      canContinue={profile.examGoals.length > 0}>
      {exams.map((e) => (
        <OptionCard
          key={e.id}
          multi
          label={e.label}
          description={e.description}
          selected={profile.examGoals.includes(e.id)}
          onPress={() =>
            update({
              examGoals: toggleIn(
                profile.examGoals.filter((x) => x !== NO_EXAM),
                e.id,
              ),
            })
          }
        />
      ))}
      <OptionCard
        label={t('noExam')}
        description={t('exams.noExamHint')}
        emoji="🌱"
        selected={noExam}
        onPress={() => update({ examGoals: noExam ? [] : [NO_EXAM], examMonth: null })}
      />

      {hasExam && (
        <Animated.View entering={FadeIn} style={{ gap: Spacing.sm, marginTop: Spacing.sm }}>
          <Text variant="heading">{t('exams.whenTitle')}</Text>
          <Text variant="small" color={Colors.textSecondary}>
            {t('exams.whenHint')}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <ChipWrap>
              {upcomingMonths().map((m) => (
                <ChoiceChip
                  key={m.id}
                  label={m.label}
                  selected={profile.examMonth === m.id}
                  onPress={() => update({ examMonth: profile.examMonth === m.id ? null : m.id })}
                />
              ))}
            </ChipWrap>
          </ScrollView>
        </Animated.View>
      )}
    </StepScreen>
  );
}
