import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { StepScreen } from '@/components/personalize/step-screen';
import { RegionList } from '@/components/region-picker';
import { usePersonalization } from '@/lib/personalization-store';
import { guessRegion } from '@/lib/region';

/**
 * Where the student studies: it decides the exams offered on the next steps and the exam practice
 * the app shows first. The device's country is chosen to start with; the student can pick any other.
 */
export default function RegionScreen() {
  const { profile, update } = usePersonalization();
  const { t } = useTranslation('personalize');
  const [guess] = useState(guessRegion);
  const region = profile.region ?? guess;

  return (
    <StepScreen
      step="region"
      title={t('region.title')}
      subtitle={t('region.subtitle')}
      // The pre-selected country counts as the answer if they just continue.
      onContinue={() => update({ region })}>
      <RegionList
        value={region}
        onSelect={(code) =>
          // Exam goals depend on the country, so a different one clears them.
          code === profile.region ? undefined : update({ region: code, examGoals: [], examMonth: null })
        }
      />
    </StepScreen>
  );
}
