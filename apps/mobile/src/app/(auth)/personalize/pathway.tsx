import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { TextField } from '@/components/auth/text-field';
import { ChoiceChip, ChipWrap } from '@/components/personalize/choice-chip';
import { StepScreen } from '@/components/personalize/step-screen';
import { Spacing } from '@/constants/theme';
import { PATHWAYS, learnerKey } from '@/lib/personalization';
import { usePersonalization } from '@/lib/personalization-store';

export default function PathwayScreen() {
  const { profile, update } = usePersonalization();
  const { t } = useTranslation('personalize');
  const type = learnerKey(profile.learnerType);
  const path = PATHWAYS[type];

  return (
    <StepScreen
      step="pathway"
      title={t(`pathways.${type}.title`)}
      subtitle={t(`pathways.${type}.subtitle`)}
      canContinue={!!profile.track}>
      <ChipWrap>
        {path.tracks.map((o) => (
          <ChoiceChip
            key={o.id}
            label={o.label}
            emoji={o.emoji}
            selected={profile.track === o.id}
            // The track drives subject suggestions, so a new track clears picked subjects.
            onPress={() => update({ track: o.id, subjects: profile.track === o.id ? profile.subjects : [] })}
          />
        ))}
      </ChipWrap>
      <View style={{ marginTop: Spacing.sm }}>
        <TextField
          label={t(`pathways.${type}.institutionLabel`)}
          icon="business-outline"
          placeholder={t(`pathways.${type}.institutionPlaceholder`)}
          value={profile.institution}
          onChangeText={(institution) => update({ institution })}
          autoCapitalize="words"
          returnKeyType="done"
        />
      </View>
    </StepScreen>
  );
}
