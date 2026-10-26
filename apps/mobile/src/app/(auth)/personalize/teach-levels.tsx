import { useTranslation } from 'react-i18next';

import { ChoiceChip, ChipWrap } from '@/components/personalize/choice-chip';
import { StepScreen } from '@/components/personalize/step-screen';
import { TEACH_LEVELS, toggleIn } from '@/lib/personalization';
import { usePersonalization } from '@/lib/personalization-store';

export default function TeachLevelsScreen() {
  const { profile, update } = usePersonalization();
  const { t } = useTranslation('personalize');

  return (
    <StepScreen
      step="teach-levels"
      title={t('teachLevels.title')}
      subtitle={t('teachLevels.subtitle')}
      canContinue={profile.teachLevels.length > 0}
      helper={profile.teachLevels.length ? t('selected', { count: profile.teachLevels.length }) : t('pickAtLeastOne')}>
      <ChipWrap>
        {TEACH_LEVELS.map((l) => (
          <ChoiceChip
            key={l.id}
            label={l.label}
            emoji={l.emoji}
            selected={profile.teachLevels.includes(l.id)}
            onPress={() => update({ teachLevels: toggleIn(profile.teachLevels, l.id) })}
          />
        ))}
      </ChipWrap>
    </StepScreen>
  );
}
