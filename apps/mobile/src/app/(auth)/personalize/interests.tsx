import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { StepScreen } from '@/components/personalize/step-screen';
import { Text } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { INTERESTS, toggleIn } from '@/lib/personalization';
import { usePersonalization } from '@/lib/personalization-store';

export default function InterestsScreen() {
  const { profile, update } = usePersonalization();
  const { t } = useTranslation('personalize');
  const count = profile.interests.length;

  return (
    <StepScreen
      step="interests"
      title={t('interests.title')}
      subtitle={t('interests.subtitle')}
      skippable
      canContinue={count >= 1}
      helper={count < 3 ? t('interests.pickMore', { count: 3 - count }) : t('interests.great', { count })}>
      <View style={styles.grid}>
        {INTERESTS.map((i) => {
          const selected = profile.interests.includes(i.id);
          return (
            <Pressable
              key={i.id}
              onPress={() => {
                Haptics.selectionAsync().catch(() => {});
                update({ interests: toggleIn(profile.interests, i.id) });
              }}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: selected }}
              accessibilityLabel={i.label}
              style={({ pressed }) => [
                styles.tile,
                selected && styles.selected,
                { transform: [{ scale: pressed ? 0.95 : 1 }] },
              ]}>
              <Text style={styles.emoji}>{i.emoji}</Text>
              <Text
                variant="small"
                center
                color={selected ? Colors.text : Colors.textSecondary}
                style={{ fontFamily: 'Manrope_600SemiBold' }}>
                {i.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </StepScreen>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  tile: {
    width: '31.5%',
    flexGrow: 1,
    aspectRatio: 1.05,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: Spacing.xs,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  selected: { borderColor: Colors.primary, backgroundColor: Colors.primarySoft },
  emoji: { fontSize: 30, lineHeight: 38 },
});
