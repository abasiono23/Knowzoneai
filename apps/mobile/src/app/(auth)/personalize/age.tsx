import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { StepScreen } from '@/components/personalize/step-screen';
import { Card, Text } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { AGE_GROUPS } from '@/lib/personalization';
import { usePersonalization } from '@/lib/personalization-store';

export default function AgeScreen() {
  const { profile, update } = usePersonalization();
  const { t } = useTranslation('personalize');

  return (
    <StepScreen step="age" title={t('age.title')} subtitle={t('age.subtitle')} canContinue={!!profile.ageGroup}>
      <View style={styles.grid}>
        {AGE_GROUPS.map((a) => {
          const selected = profile.ageGroup === a.id;
          return (
            <Pressable
              key={a.id}
              onPress={() => {
                Haptics.selectionAsync().catch(() => {});
                update({ ageGroup: a.id });
              }}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              accessibilityLabel={a.label}
              style={({ pressed }) => [
                styles.tile,
                selected && styles.selected,
                { transform: [{ scale: pressed ? 0.97 : 1 }] },
              ]}>
              <Text style={styles.emoji}>{a.emoji}</Text>
              <Text variant="heading">{a.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {profile.ageGroup === 'under-13' && (
        <Animated.View entering={FadeIn}>
          <Card style={styles.notice}>
            <Ionicons name="people" size={20} color={Colors.reward} />
            <Text variant="small" color={Colors.textSecondary} style={{ flex: 1 }}>
              {t('age.under13Notice')}
            </Text>
          </Card>
        </Animated.View>
      )}
    </StepScreen>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  tile: {
    width: '48%',
    flexGrow: 1,
    alignItems: 'center',
    gap: 6,
    paddingVertical: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  selected: { borderColor: Colors.primary, backgroundColor: Colors.primarySoft },
  emoji: { fontSize: 32, lineHeight: 40 },
  notice: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'flex-start',
    backgroundColor: Colors.rewardSoft,
    borderColor: Colors.reward,
  },
});
