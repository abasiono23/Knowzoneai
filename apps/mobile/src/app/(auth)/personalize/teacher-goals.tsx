import { useTranslation } from 'react-i18next';

import { OptionCard } from '@/components/personalize/option-card';
import { StepScreen } from '@/components/personalize/step-screen';
import { TEACHER_GOALS, toggleIn } from '@/lib/personalization';
import { usePersonalization } from '@/lib/personalization-store';

export default function TeacherGoalsScreen() {
  const { profile, update } = usePersonalization();
  const { t } = useTranslation('personalize');

  return (
    <StepScreen
      step="teacher-goals"
      title={t('teacherGoals.title')}
      subtitle={t('teacherGoals.subtitle')}
      canContinue={profile.teacherGoals.length > 0}>
      {TEACHER_GOALS.map((g) => (
        <OptionCard
          key={g.id}
          multi
          label={g.label}
          icon={g.icon}
          color="#FF9F43"
          selected={profile.teacherGoals.includes(g.id)}
          onPress={() => update({ teacherGoals: toggleIn(profile.teacherGoals, g.id) })}
        />
      ))}
    </StepScreen>
  );
}
