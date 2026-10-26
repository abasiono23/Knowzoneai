import { useTranslation } from 'react-i18next';

import { OptionCard } from '@/components/personalize/option-card';
import { StepScreen } from '@/components/personalize/step-screen';
import { TEACHER_ROLES } from '@/lib/personalization';
import { usePersonalization } from '@/lib/personalization-store';

export default function TeacherRoleScreen() {
  const { profile, update } = usePersonalization();
  const { t } = useTranslation('personalize');

  return (
    <StepScreen
      step="teacher-role"
      title={t('teacherRole.title')}
      subtitle={t('teacherRole.subtitle')}
      canContinue={!!profile.teacherRole}>
      {TEACHER_ROLES.map((r) => (
        <OptionCard
          key={r.id}
          label={r.label}
          description={r.description}
          icon={r.icon}
          color="#FF9F43"
          selected={profile.teacherRole === r.id}
          onPress={() => update({ teacherRole: r.id })}
        />
      ))}
    </StepScreen>
  );
}
