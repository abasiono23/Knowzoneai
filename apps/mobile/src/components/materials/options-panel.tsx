import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { ChoiceChip, ChipWrap } from '@/components/personalize/choice-chip';
import { Card, Text } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { toggleIn } from '@/lib/personalization';
import { depthLabel, difficultyLabel, outputLabel } from '@/lib/studio/labels';
import { OUTPUTS, type Depth, type Difficulty, type GenerateOptions } from '@/lib/studio/types';

const DEPTHS: Depth[] = ['Quick', 'Standard', 'Deep'];
const LEVELS: Difficulty[] = ['Beginner', 'Intermediate', 'Advanced'];

/** What to generate and how deep. Collapsed by default so the main input stays the focus. */
export function OptionsPanel({ value, onChange }: { value: GenerateOptions; onChange: (v: GenerateOptions) => void }) {
  const { t } = useTranslation('study');
  const [open, setOpen] = useState(false);
  return (
    <Card style={{ gap: Spacing.sm }}>
      <Pressable
        onPress={() => setOpen((o) => !o)}
        accessibilityRole="button"
        accessibilityLabel={t('options.a11y')}
        style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ flex: 1 }}>
          <Text variant="bodyStrong">{t('options.title')}</Text>
          <Text variant="small" color={Colors.textSecondary}>
            {t('options.summary', {
              depth: depthLabel(value.depth, t),
              difficulty: difficultyLabel(value.difficulty, t),
              count: value.outputs.length,
              total: OUTPUTS.length,
            })}
          </Text>
        </View>
        <Text variant="small" color={Colors.primary}>
          {open ? t('actions.done', { ns: 'common' }) : t('options.change')}
        </Text>
      </Pressable>
      {open && (
        <View style={{ gap: Spacing.sm }}>
          <Text variant="label" color={Colors.textMuted}>
            {t('options.depth')}
          </Text>
          <ChipWrap>
            {DEPTHS.map((d) => (
              <ChoiceChip
                key={d}
                label={depthLabel(d, t)}
                selected={value.depth === d}
                onPress={() => onChange({ ...value, depth: d })}
              />
            ))}
          </ChipWrap>
          <Text variant="label" color={Colors.textMuted}>
            {t('options.level')}
          </Text>
          <ChipWrap>
            {LEVELS.map((d) => (
              <ChoiceChip
                key={d}
                label={difficultyLabel(d, t)}
                selected={value.difficulty === d}
                onPress={() => onChange({ ...value, difficulty: d })}
              />
            ))}
          </ChipWrap>
          <Text variant="label" color={Colors.textMuted}>
            {t('options.create')}
          </Text>
          <ChipWrap>
            {OUTPUTS.map((o) => (
              <ChoiceChip
                key={o.id}
                label={outputLabel(o.id, t)}
                selected={value.outputs.includes(o.id)}
                // The summary is always made: everything else builds on it.
                onPress={() => o.id !== 'summary' && onChange({ ...value, outputs: toggleIn(value.outputs, o.id) })}
              />
            ))}
          </ChipWrap>
        </View>
      )}
    </Card>
  );
}
