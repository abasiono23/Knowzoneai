import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, Radius, Spacing } from '@/constants/theme';

import { Text } from './text';

export type SheetOption = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  destructive?: boolean;
};

/** Cross-platform options menu (Alert buttons don't work on web). */
export function ActionSheet({
  visible,
  title,
  options,
  onClose,
}: {
  visible: boolean;
  title?: string;
  options: SheetOption[];
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel={t('actions.closeMenu')} />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + Spacing.md }]}>
        {title && (
          <Text variant="small" color={Colors.textMuted} center numberOfLines={1} style={{ marginBottom: Spacing.xs }}>
            {title}
          </Text>
        )}
        {options.map((o) => (
          <Pressable
            key={o.label}
            onPress={() => {
              onClose();
              o.onPress();
            }}
            accessibilityRole="button"
            accessibilityLabel={o.label}
            style={({ pressed }) => [styles.option, pressed && { backgroundColor: Colors.surfaceRaised }]}>
            <Ionicons name={o.icon} size={20} color={o.destructive ? Colors.danger : Colors.text} />
            <Text color={o.destructive ? Colors.danger : Colors.text}>{o.label}</Text>
          </Pressable>
        ))}
        <Pressable onPress={onClose} accessibilityRole="button" style={[styles.option, styles.cancel]}>
          <Text variant="bodyStrong" center style={{ flex: 1 }}>
            Cancel
          </Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(4, 6, 20, 0.7)' },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxWidth: 560,
    width: '100%',
    alignSelf: 'center',
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    padding: Spacing.md,
    gap: 4,
  },
  option: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.md, borderRadius: Radius.md },
  cancel: { marginTop: Spacing.xs, backgroundColor: Colors.surfaceRaised },
});
