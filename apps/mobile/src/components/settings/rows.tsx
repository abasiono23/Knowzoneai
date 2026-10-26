import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Switch, View } from 'react-native';

import { Card, Text } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';

type Icon = keyof typeof Ionicons.glyphMap;

export function SettingsSection({ title, children, footer }: { title?: string; children: ReactNode; footer?: string }) {
  return (
    <View style={{ gap: Spacing.xs }}>
      {title && (
        <Text variant="label" color={Colors.textMuted}>
          {title.toUpperCase()}
        </Text>
      )}
      <Card style={styles.card}>{children}</Card>
      {footer && (
        <Text variant="small" color={Colors.textMuted} style={{ fontSize: 12, paddingHorizontal: 4 }}>
          {footer}
        </Text>
      )}
    </View>
  );
}

/** A tappable settings row: icon, label, current value and a chevron. */
export function SettingsLink({
  icon,
  label,
  value,
  onPress,
  color = Colors.primary,
  danger,
  last,
}: {
  icon: Icon;
  label: string;
  value?: string;
  onPress: () => void;
  color?: string;
  danger?: boolean;
  last?: boolean;
}) {
  const { t } = useTranslation('settings');
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={value ? t('rows.labelValue', { label, value }) : label}
      style={({ pressed }) => [
        styles.row,
        !last && styles.divider,
        pressed && { backgroundColor: Colors.surfaceRaised },
      ]}>
      <View style={[styles.icon, { backgroundColor: (danger ? Colors.danger : color) + '22' }]}>
        <Ionicons name={icon} size={18} color={danger ? Colors.danger : color} />
      </View>
      <Text variant="bodyStrong" style={{ flex: 1, fontSize: 15 }} color={danger ? Colors.danger : Colors.text}>
        {label}
      </Text>
      {value !== undefined && (
        <Text variant="small" color={Colors.textMuted} numberOfLines={1} style={{ maxWidth: '45%' }}>
          {value}
        </Text>
      )}
      <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
    </Pressable>
  );
}

export function SettingsToggle({
  icon,
  label,
  hint,
  value,
  onChange,
  disabled,
  last,
  color = Colors.primary,
}: {
  icon?: Icon;
  label: string;
  hint?: string;
  value: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  last?: boolean;
  color?: string;
}) {
  return (
    <View style={[styles.row, !last && styles.divider, disabled && { opacity: 0.5 }]}>
      {icon && (
        <View style={[styles.icon, { backgroundColor: color + '22' }]}>
          <Ionicons name={icon} size={18} color={color} />
        </View>
      )}
      <View style={{ flex: 1 }}>
        <Text variant="bodyStrong" style={{ fontSize: 15 }}>
          {label}
        </Text>
        {hint && (
          <Text variant="small" color={Colors.textMuted} style={{ fontSize: 12 }}>
            {hint}
          </Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        disabled={disabled}
        trackColor={{ true: Colors.primary, false: Colors.surfaceRaised }}
        thumbColor="#fff"
        accessibilityLabel={label}
      />
    </View>
  );
}

/** A selectable row with a radio mark. */
export function SettingsChoice({
  label,
  hint,
  selected,
  onPress,
  disabled,
  last,
  badge,
}: {
  label: string;
  hint?: string;
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
  last?: boolean;
  badge?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="radio"
      accessibilityState={{ selected, disabled }}
      accessibilityLabel={label}
      style={[styles.row, !last && styles.divider, disabled && { opacity: 0.45 }]}>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text variant="bodyStrong" style={{ fontSize: 15 }}>
            {label}
          </Text>
          {badge && (
            <View style={styles.badge}>
              <Text variant="label" color={Colors.info} style={{ fontSize: 9 }}>
                {badge}
              </Text>
            </View>
          )}
        </View>
        {hint && (
          <Text variant="small" color={Colors.textMuted} style={{ fontSize: 12 }}>
            {hint}
          </Text>
        )}
      </View>
      <View style={[styles.radio, selected && styles.radioOn]}>{selected && <View style={styles.radioDot} />}</View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { padding: 0, overflow: 'hidden' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    minHeight: 56,
  },
  divider: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  icon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: { borderColor: Colors.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary },
  badge: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: Radius.pill, backgroundColor: Colors.info + '22' },
});
