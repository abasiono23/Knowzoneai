import { Pressable } from 'react-native';

import { Colors, Radius, Spacing } from '@/constants/theme';

import { Text } from './text';

type Props = { label: string; selected?: boolean; onPress?: () => void };

export function Chip({ label, selected, onPress }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={{
        paddingVertical: Spacing.xs,
        paddingHorizontal: Spacing.md,
        borderRadius: Radius.pill,
        borderWidth: 1,
        borderColor: selected ? Colors.primary : Colors.border,
        backgroundColor: selected ? Colors.primarySoft : Colors.surface,
      }}>
      <Text variant="small" color={selected ? Colors.text : Colors.textSecondary}>
        {label}
      </Text>
    </Pressable>
  );
}
