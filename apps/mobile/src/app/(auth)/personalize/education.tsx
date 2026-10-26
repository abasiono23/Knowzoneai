import { useTranslation } from 'react-i18next';

import { OptionCard } from '@/components/personalize/option-card';
import { StepScreen } from '@/components/personalize/step-screen';
import { EDUCATION_LEVELS, learnerKey } from '@/lib/personalization';
import { usePersonalization } from '@/lib/personalization-store';

export default function EducationScreen() {
  const { profile, update } = usePersonalization();
  const { t } = useTranslation('personalize');
  const levels = EDUCATION_LEVELS[learnerKey(profile.learnerType)];
  const working = profile.learnerType === 'professional' || profile.learnerType === 'lifelong';

  return (
    <StepScreen
      step="education"
      title={working ? t('education.titleWorking') : t('education.title')}
      subtitle={t('education.subtitle')}
      canContinue={!!profile.educationLevel}>
      {levels.map((l) => (
        <OptionCard
          key={l.id}
          label={l.label}
          description={l.description}
          icon={l.icon}
          selected={profile.educationLevel === l.id}
          onPress={() => update({ educationLevel: l.id })}
        />
      ))}
    </StepScreen>
  );
}
