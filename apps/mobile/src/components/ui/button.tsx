import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator, Pressable, StyleSheet, View, type ViewStyle } from 'react-native';

import { Colors, Gradients, Radius, Spacing } from '@/constants/theme';

import { Text } from './text';

type Props = {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  icon?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
};

export function Button({ title, onPress, variant = 'primary', icon, loading, disabled, style }: Props) {
  const inactive = disabled || loading;

  const content = (
    <View style={styles.row}>
      {loading ? (
        <ActivityIndicator color={Colors.textOnAccent} />
      ) : (
        <>
          {icon && <Ionicons name={icon} size={20} color={Colors.text} />}
          <Text variant="bodyStrong">{title}</Text>
        </>
      )}
    </View>
  );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      disabled={inactive}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        onPress?.();
      }}
      style={({ pressed }) => [{ opacity: inactive ? 0.5 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] }, style]}>
      {variant === 'primary' ? (
        <LinearGradient
          colors={Gradients.ai}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.base, styles.primaryShadow]}>
          {content}
        </LinearGradient>
      ) : (
        <View
          style={[
            styles.base,
            variant === 'secondary' ? styles.secondary : variant === 'danger' ? styles.danger : styles.ghost,
          ]}>
          {content}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 54,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  primaryShadow: {
    shadowColor: Colors.primary,
    shadowOpacity: 0.45,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  secondary: {
    backgroundColor: Colors.surfaceRaised,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
  },
  ghost: { backgroundColor: 'transparent' },
  danger: { backgroundColor: Colors.danger },
});
