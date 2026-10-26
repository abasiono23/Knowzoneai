import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { TextField } from '@/components/auth/text-field';
import { ChoiceChip, ChipWrap } from '@/components/personalize/choice-chip';
import { StepScreen } from '@/components/personalize/step-screen';
import { Button, Text } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { subjectCatalog, subjectLabel, toggleIn } from '@/lib/personalization';
import { usePersonalization } from '@/lib/personalization-store';

const MAX = 10;

export default function SubjectsScreen() {
  const { profile, update } = usePersonalization();
  const { t } = useTranslation('personalize');
  const [query, setQuery] = useState('');
  const teacher = profile.learnerType === 'teacher';
  const { suggested, all } = useMemo(() => subjectCatalog(profile.track), [profile.track]);

  const q = query.trim().toLowerCase();
  const custom = profile.subjects.filter((s) => !suggested.includes(s) && !all.includes(s));
  const matches = q
    ? [...suggested, ...all, ...custom].filter(
        (s) => s.toLowerCase().includes(q) || subjectLabel(s).toLowerCase().includes(q),
      )
    : null;
  const canAdd = q.length > 1 && !matches?.some((s) => s.toLowerCase() === q || subjectLabel(s).toLowerCase() === q);
  const full = profile.subjects.length >= MAX;

  const toggle = (s: string) => update({ subjects: toggleIn(profile.subjects, s, MAX) });
  const chip = (s: string) => (
    <ChoiceChip
      key={s}
      label={subjectLabel(s)}
      selected={profile.subjects.includes(s)}
      disabled={full && !profile.subjects.includes(s)}
      onPress={() => toggle(s)}
    />
  );

  return (
    <StepScreen
      step="subjects"
      title={teacher ? t('subjectStep.titleTeacher') : t('subjectStep.title')}
      subtitle={teacher ? t('subjectStep.subtitleTeacher') : t('subjectStep.subtitle')}
      canContinue={profile.subjects.length > 0}
      helper={
        profile.subjects.length
          ? t('selectedOfMax', { count: profile.subjects.length, max: MAX })
          : t('subjectStep.pickOne')
      }>
      <TextField
        label={t('subjectStep.search')}
        icon="search"
        placeholder={t('subjectStep.searchPlaceholder')}
        value={query}
        onChangeText={setQuery}
      />

      {matches ? (
        <View style={{ gap: Spacing.sm }}>
          <ChipWrap>{matches.map(chip)}</ChipWrap>
          {canAdd && (
            <Button
              variant="secondary"
              icon="add"
              title={t('subjectStep.add', { name: query.trim() })}
              disabled={full}
              onPress={() => {
                toggle(query.trim());
                setQuery('');
              }}
            />
          )}
        </View>
      ) : (
        <>
          <Text variant="label" color={Colors.success}>
            {t('subjectStep.suggested')}
          </Text>
          <ChipWrap>{[...suggested, ...custom].map(chip)}</ChipWrap>
          <Text variant="label" color={Colors.textMuted} style={{ marginTop: Spacing.sm }}>
            {t('subjectStep.more')}
          </Text>
          <ChipWrap>{all.slice(0, 18).map(chip)}</ChipWrap>
        </>
      )}
    </StepScreen>
  );
}
