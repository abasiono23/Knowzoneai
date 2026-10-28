import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

import { Colors, Radius, Spacing } from '@/constants/theme';

import { Text } from './text';

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  value: string | number;
  color: string;
  label: string;
};

export function StatPill({ icon, value, color, label }: Props) {
  return (
    <View
      accessible
      accessibilityLabel={`${value} ${label}`}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xxs,
        paddingVertical: 6,
        paddingHorizontal: Spacing.sm,
        borderRadius: Radius.pill,
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
      }}>
      <Ionicons name={icon} size={16} color={color} />
      <Text variant="label" color={Colors.text}>
        {value}
      </Text>
    </View>
  );
}
