import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';

type Props = { label: string; emoji?: string; selected: boolean; onPress: () => void; disabled?: boolean };

/** Multi-select pill for subjects, interests and exams. */
export function ChoiceChip({ label, emoji, selected, onPress, disabled }: Props) {
  return (
    <Pressable
      onPress={() => {
        Haptics.selectionAsync().catch(() => {});
        onPress();
      }}
      disabled={disabled}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected, disabled }}
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.chip,
        selected && styles.selected,
        { opacity: disabled ? 0.4 : 1, transform: [{ scale: pressed ? 0.96 : 1 }] },
      ]}>
      {emoji && <Text style={styles.emoji}>{emoji}</Text>}
      <Text
        variant="small"
        color={selected ? Colors.text : Colors.textSecondary}
        style={{ fontFamily: 'Manrope_600SemiBold' }}>
        {label}
      </Text>
      {selected && (
        <View style={styles.tick}>
          <Ionicons name="checkmark" size={11} color={Colors.textOnAccent} />
        </View>
      )}
    </Pressable>
  );
}

export function ChipWrap({ children }: { children: React.ReactNode }) {
  return <View style={styles.wrap}>{children}</View>;
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: Radius.pill,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  selected: { borderColor: Colors.primary, backgroundColor: Colors.primarySoft },
  emoji: { fontSize: 16, lineHeight: 20 },
  tick: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
