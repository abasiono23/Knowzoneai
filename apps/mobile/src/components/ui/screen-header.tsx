import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { Colors, Radius, Spacing } from '@/constants/theme';
import { useFlipStyle } from '@/i18n/provider';

import { Text } from './text';

type Props = { title?: string; eyebrow?: string; eyebrowColor?: string; right?: ReactNode; back?: boolean };

/** Back button + title row for stack screens. */
export function ScreenHeader({ title, eyebrow, eyebrowColor = Colors.primary, right, back = true }: Props) {
  const { t } = useTranslation();
  const flip = useFlipStyle();
  return (
    <View style={styles.row}>
      {back && (
        <Pressable
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel={t('actions.goBack')}
          style={styles.iconButton}>
          <Ionicons name="chevron-back" size={22} color={Colors.text} style={flip} />
        </Pressable>
      )}
      <View style={{ flex: 1 }}>
        {eyebrow && (
          <Text variant="label" color={eyebrowColor}>
            {eyebrow}
          </Text>
        )}
        {title && (
          <Text variant="title" numberOfLines={1}>
            {title}
          </Text>
        )}
      </View>
      {right}
    </View>
  );
}

export function IconButton({
  icon,
  label,
  onPress,
  badge,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  badge?: number;
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={styles.iconButton}>
      <Ionicons name={icon} size={20} color={Colors.text} />
      {!!badge && (
        <View style={styles.badge}>
          <Text variant="label" style={{ fontSize: 10, lineHeight: 13 }}>
            {badge > 9 ? '9+' : badge}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: Colors.danger,
    borderWidth: 2,
    borderColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
