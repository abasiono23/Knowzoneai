import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Text } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useFlipStyle } from '@/i18n/provider';

/** Screen 56: suggested follow-up questions under the latest answer. */
export function FollowUps({
  items,
  onPick,
  disabled,
}: {
  items: string[];
  onPick: (q: string) => void;
  disabled?: boolean;
}) {
  const { t } = useTranslation('tutor');
  const flip = useFlipStyle();
  if (!items.length) return null;
  return (
    <View style={{ gap: Spacing.xs }}>
      <Text variant="label" color={Colors.textMuted}>
        {t('followUps.title')}
      </Text>
      {items.map((q, i) => (
        <Animated.View key={q} entering={FadeInDown.delay(i * 70).duration(300)}>
          <Pressable
            onPress={() => onPick(q)}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityLabel={t('followUps.askLabel', { question: q })}
            style={({ pressed }) => [styles.chip, { opacity: disabled ? 0.5 : pressed ? 0.7 : 1 }]}>
            <Ionicons name="return-down-forward" size={16} color={Colors.primary} style={flip} />
            <Text variant="small" style={{ flex: 1 }}>
              {q}
            </Text>
          </Pressable>
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: 10,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.primary + '55',
    backgroundColor: Colors.primarySoft,
  },
});
