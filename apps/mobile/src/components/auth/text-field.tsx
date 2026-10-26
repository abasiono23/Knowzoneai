import { Ionicons } from '@expo/vector-icons';
import { useState, type Ref } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps, type TextInputInstance } from 'react-native';

import { Text } from '@/components/ui';
import { Colors, Fonts, Radius, Spacing, NoWebOutline } from '@/constants/theme';

type Props = TextInputProps & {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  error?: string | null;
  hint?: string;
  password?: boolean;
  ref?: Ref<TextInputInstance>;
};

export function TextField({ label, icon, error, hint, password, ref, onFocus, onBlur, ...props }: Props) {
  const { t } = useTranslation('auth');
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(true);

  const borderColor = error ? Colors.danger : focused ? Colors.primary : Colors.border;

  return (
    <View style={{ gap: 6 }}>
      <Text variant="small" color={Colors.textSecondary} style={{ fontFamily: Fonts.semibold }}>
        {label}
      </Text>
      <View style={[styles.box, { borderColor }, focused && !error && styles.focusGlow]}>
        <Ionicons name={icon} size={20} color={focused ? Colors.primary : Colors.textMuted} />
        <TextInput
          ref={ref}
          placeholderTextColor={Colors.textMuted}
          selectionColor={Colors.primary}
          style={styles.input}
          accessibilityLabel={label}
          secureTextEntry={password && hidden}
          autoCorrect={false}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...props}
        />
        {password && (
          <Pressable
            onPress={() => setHidden((h) => !h)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={hidden ? t('shared.showPassword') : t('shared.hidePassword')}>
            <Ionicons name={hidden ? 'eye-outline' : 'eye-off-outline'} size={20} color={Colors.textMuted} />
          </Pressable>
        )}
      </View>
      {error ? (
        <View style={styles.message}>
          <Ionicons name="alert-circle" size={14} color={Colors.danger} />
          <Text variant="small" color={Colors.danger} style={{ flex: 1 }}>
            {error}
          </Text>
        </View>
      ) : hint ? (
        <Text variant="small" color={Colors.textMuted}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    minHeight: 56,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    backgroundColor: Colors.surface,
  },
  focusGlow: {
    backgroundColor: Colors.surfaceRaised,
    shadowColor: Colors.primary,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  input: {
    flex: 1,
    color: Colors.text,
    ...NoWebOutline,
    fontFamily: Fonts.regular,
    fontSize: 16,
    paddingVertical: Spacing.sm,
  },
  message: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});
