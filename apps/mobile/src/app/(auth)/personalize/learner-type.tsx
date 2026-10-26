import { useTranslation } from 'react-i18next';

import { OptionCard } from '@/components/personalize/option-card';
import { StepScreen } from '@/components/personalize/step-screen';
import { LEARNER_TYPES } from '@/lib/personalization';
import { usePersonalization } from '@/lib/personalization-store';
import { useSession } from '@/lib/session';

export default function LearnerTypeScreen() {
  const { profile, update } = usePersonalization();
  const { user } = useSession();
  const { t } = useTranslation('personalize');

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
          description={o.description}
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
