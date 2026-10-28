import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';

import { Text } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';

type Props = {
  label: string;
  description?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  emoji?: string;
  /** Accent for the icon tile; defaults to brand purple. */
  color?: string;
  selected: boolean;
  onPress: () => void;
  /** Radio (single choice) or checkbox (multi choice) indicator. */
  multi?: boolean;
  badge?: string;
};

/** Large tappable answer card used across the personalization steps. */
export function OptionCard({
  label,
  description,
  icon,
  emoji,
  color = Colors.primary,
  selected,
  onPress,
  multi,
  badge,
}: Props) {
  const { t } = useTranslation('personalize');
  return (
    <Pressable
      onPress={() => {
        Haptics.selectionAsync().catch(() => {});
        onPress();
      }}
      accessibilityRole={multi ? 'checkbox' : 'radio'}
      accessibilityState={{ checked: selected }}
      accessibilityLabel={description ? t('optionA11y', { label, description }) : label}
      style={({ pressed }) => [
        styles.card,
        selected && styles.selected,
        { transform: [{ scale: pressed ? 0.98 : 1 }] },
      ]}>
      {(icon || emoji) && (
        <View style={[styles.icon, { backgroundColor: color + '22' }]}>
          {icon ? <Ionicons name={icon} size={22} color={color} /> : <Text style={styles.emoji}>{emoji}</Text>}
        </View>
      )}
      <View style={{ flex: 1, gap: 2 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.xs }}>
          <Text variant="bodyStrong">{label}</Text>
          {badge && (
            <View style={styles.badge}>
              <Text variant="label" color={Colors.onBright} style={{ fontSize: 10, lineHeight: 14 }}>
                {badge}
              </Text>
            </View>
          )}
        </View>
        {description && (
          <Text variant="small" color={Colors.textSecondary}>
            {description}
          </Text>
        )}
      </View>
      <View style={[multi ? styles.check : styles.radio, selected && styles.indicatorOn]}>
        {selected && (
          <Animated.View entering={ZoomIn.duration(160)}>
            {multi ? <Ionicons name="checkmark" size={15} color={Colors.textOnAccent} /> : <View style={styles.dot} />}
          </Animated.View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    minHeight: 64,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  selected: { borderColor: Colors.primary, backgroundColor: Colors.primarySoft },
  icon: { width: 44, height: 44, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 22, lineHeight: 28 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: Colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicatorOn: { borderColor: Colors.primary, backgroundColor: Colors.primary },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.textOnAccent },
  badge: { backgroundColor: Colors.reward, borderRadius: Radius.pill, paddingHorizontal: 6, paddingVertical: 1 },
});
