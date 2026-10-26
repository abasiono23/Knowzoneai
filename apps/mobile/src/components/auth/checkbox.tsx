import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';

import { Colors, Radius, Spacing } from '@/constants/theme';

type Props = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: ReactNode;
  label: string;
};

export function Checkbox({ checked, onChange, children, label }: Props) {
  return (
    <Pressable
      onPress={() => {
        Haptics.selectionAsync().catch(() => {});
        onChange(!checked);
      }}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={label}
      style={styles.row}>
      <View style={[styles.box, checked && styles.checked]}>
        {checked && (
          <Animated.View entering={ZoomIn.duration(180)}>
            <Ionicons name="checkmark" size={16} color={Colors.textOnAccent} />
          </Animated.View>
        )}
      </View>
      <View style={{ flex: 1 }}>{children}</View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, paddingVertical: 4 },
  box: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: Colors.borderStrong,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checked: { backgroundColor: Colors.primary, borderColor: Colors.primary, borderRadius: Radius.sm - 3 },
});
