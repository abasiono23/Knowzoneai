import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { OptionCard } from '@/components/personalize/option-card';
import { StepScreen } from '@/components/personalize/step-screen';
import { examExamples, LEARNER_TYPES } from '@/lib/personalization';
import { usePersonalization } from '@/lib/personalization-store';
import { chosenRegion, DEFAULT_REGION, guessRegion } from '@/lib/region';
import { useSession } from '@/lib/session';

export default function LearnerTypeScreen() {
  const { profile, update } = usePersonalization();
  const { user } = useSession();
  const { t } = useTranslation('personalize');
  // The region question comes next, so the examples follow where the device is until then.
  const [guess] = useState(guessRegion);
  const region = profile.region ?? chosenRegion(user) ?? guess;

  return (
    <StepScreen
      step="learner-type"
      title={user?.name ? t('learnerType.titleNamed', { name: user.name }) : t('learnerType.title')}
      subtitle={t('learnerType.subtitle')}
      canContinue={!!profile.learnerType}>
      {LEARNER_TYPES.map((o) => (
        <OptionCard
          key={o.id}
          label={o.label}
          description={
            o.id === 'exam' && region !== DEFAULT_REGION
              ? t('learnerTypes.exam.descriptionFor', { exams: examExamples(region) })
              : o.description
          }
          icon={o.icon}
          color={o.color}
          selected={profile.learnerType === o.id}
          onPress={() =>
            // Changing type resets answers that depend on it.
            profile.learnerType === o.id
              ? undefined
              : update({ learnerType: o.id, educationLevel: null, track: null, examGoals: [], subjects: [] })
          }
        />
      ))}
    </StepScreen>
  );
}
