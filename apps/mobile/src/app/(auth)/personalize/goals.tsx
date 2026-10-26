import { useTranslation } from 'react-i18next';

import { OptionCard } from '@/components/personalize/option-card';
import { StepScreen } from '@/components/personalize/step-screen';
import { GOALS, toggleIn } from '@/lib/personalization';
import { usePersonalization } from '@/lib/personalization-store';

const MAX = 3;

export default function GoalsScreen() {
  const { profile, update } = usePersonalization();
  const { t } = useTranslation('personalize');
  const count = profile.goals.length;

  return (
    <StepScreen
      step="goals"
      title={t('goals.title')}
      subtitle={t('goals.subtitle', { max: MAX })}
      canContinue={count > 0}
      helper={count ? t('selectedOfMax', { count, max: MAX }) : undefined}>
      {GOALS.map((g) => {
        const selected = profile.goals.includes(g.id);
        return (
          <OptionCard
            key={g.id}
            multi
            label={g.label}
            icon={g.icon}
            badge={profile.goals[0] === g.id ? t('goals.mainGoal') : undefined}
            selected={selected}
            onPress={() => update({ goals: toggleIn(profile.goals, g.id, MAX) })}
          />
        );
      })}
    </StepScreen>
  );
}
