import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { ReadyMaterial } from '@/components/materials/ready-material';
import { ChoiceChip, ChipWrap } from '@/components/personalize/choice-chip';
import { Card, Screen, ScreenHeader, Text } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';

/** Screen 74: important points, with the must-knows first. */
export default function PointsScreen() {
  const { t } = useTranslation('study');
  const [only, setOnly] = useState(false);
  return (
    <ReadyMaterial>
      {(m) => {
        const points = [...m.content.keyPoints].sort((a, b) =>
          a.importance === b.importance ? 0 : a.importance === 'high' ? -1 : 1,
        );
        const shown = only ? points.filter((p) => p.importance === 'high') : points;
        return (
          <Screen withTabBar={false}>
            <ScreenHeader eyebrow={t('points.eyebrow')} eyebrowColor={Colors.reward} title={m.title} />
            <ChipWrap>
              <ChoiceChip
                label={t('points.all', { count: points.length })}
                selected={!only}
                onPress={() => setOnly(false)}
              />
              <ChoiceChip
                label={t('points.mustKnow', { count: points.filter((p) => p.importance === 'high').length })}
                emoji="⭐"
                selected={only}
                onPress={() => setOnly(true)}
              />
            </ChipWrap>
            {shown.map((p, i) => (
              <Card
                key={i}
                style={{
                  flexDirection: 'row',
                  gap: Spacing.sm,
                  alignItems: 'flex-start',
                  borderColor: p.importance === 'high' ? Colors.reward + '66' : Colors.border,
                }}>
                <View style={{ marginTop: 2 }}>
                  <Ionicons
                    name={p.importance === 'high' ? 'star' : 'ellipse'}
                    size={p.importance === 'high' ? 18 : 10}
                    color={p.importance === 'high' ? Colors.reward : Colors.primary}
                  />
                </View>
                <Text style={{ flex: 1 }}>{p.text}</Text>
              </Card>
            ))}
          </Screen>
        );
      }}
    </ReadyMaterial>
  );
}
