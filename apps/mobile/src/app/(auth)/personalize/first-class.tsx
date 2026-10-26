import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { TextField } from '@/components/auth/text-field';
import { ChoiceChip, ChipWrap } from '@/components/personalize/choice-chip';
import { StepScreen } from '@/components/personalize/step-screen';
import { Card, Text } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { subjectLabel, TEACH_LEVELS } from '@/lib/personalization';
import { usePersonalization } from '@/lib/personalization-store';

export default function FirstClassScreen() {
  const { profile, update } = usePersonalization();
  const { t } = useTranslation('personalize');
  const c = profile.firstClass ?? { name: '', subject: profile.subjects[0] ?? '', level: profile.teachLevels[0] ?? '' };
  const set = (patch: Partial<typeof c>) => update({ firstClass: { ...c, ...patch } });
  const levels = TEACH_LEVELS.filter((l) => profile.teachLevels.includes(l.id));

  return (
    <StepScreen
      step="first-class"
      title={t('firstClass.title')}
      subtitle={t('firstClass.subtitle')}
      skippable
      onSkip={() => update({ firstClass: null })}
      canContinue={!!c.name.trim() && !!c.subject}>
      <TextField
        label={t('firstClass.name')}
        icon="people-outline"
        placeholder={t('firstClass.namePlaceholder')}
        value={c.name}
        onChangeText={(name) => set({ name })}
        autoCapitalize="words"
      />

      <Text variant="heading" style={{ marginTop: Spacing.xs }}>
        {t('firstClass.subject')}
      </Text>
      <ChipWrap>
        {(profile.subjects.length ? profile.subjects : ['Mathematics', 'English Language']).map((s) => (
          <ChoiceChip key={s} label={subjectLabel(s)} selected={c.subject === s} onPress={() => set({ subject: s })} />
        ))}
      </ChipWrap>

      {levels.length > 1 && (
        <>
          <Text variant="heading" style={{ marginTop: Spacing.xs }}>
            {t('firstClass.level')}
          </Text>
          <ChipWrap>
            {levels.map((l) => (
              <ChoiceChip
                key={l.id}
                label={l.label}
                emoji={l.emoji}
                selected={c.level === l.id}
                onPress={() => set({ level: l.id })}
              />
            ))}
          </ChipWrap>
        </>
      )}

      <Card style={{ flexDirection: 'row', gap: Spacing.sm, alignItems: 'center', marginTop: Spacing.sm }}>
        <Ionicons name="key" size={20} color={Colors.reward} />
        <View style={{ flex: 1 }}>
          <Text variant="bodyStrong">{t('firstClass.joinCode')}</Text>
          <Text variant="small" color={Colors.textSecondary}>
            {t('firstClass.joinCodeHint')}
          </Text>
        </View>
      </Card>
    </StepScreen>
  );
}
