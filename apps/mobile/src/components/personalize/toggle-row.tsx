import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Switch, View } from 'react-native';

import { Text } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';

type Props = {
  label: string;
  description?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
};

export function ToggleRow({ label, description, icon, value, onChange, disabled }: Props) {
  return (
    <View style={[styles.row, disabled && { opacity: 0.45 }]}>
      {icon && (
        <View style={styles.icon}>
          <Ionicons name={icon} size={18} color={Colors.primary} />
        </View>
      )}
      <View style={{ flex: 1 }}>
        <Text variant="bodyStrong">{label}</Text>
        {description && (
          <Text variant="small" color={Colors.textSecondary}>
            {description}
          </Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        disabled={disabled}
        accessibilityLabel={label}
        trackColor={{ false: Colors.surfaceRaised, true: Colors.primary }}
        thumbColor={Colors.textOnAccent}
        ios_backgroundColor={Colors.surfaceRaised}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.xs },
  icon: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
