import type { Ref } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps, type TextInputInstance } from 'react-native';

import { Text } from '@/components/ui';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';

type Props = TextInputProps & {
  label: string;
  icon?: string;
  error?: string | null;
  hint?: string;
  password?: boolean;
  ref?: Ref<TextInputInstance>;
};

export function TextField({ label, icon, error, hint, password, ref, style, ...props }: Props) {
  void icon;

  return (
    <View style={styles.field}>
      <Text variant="small" color={Colors.textSecondary} style={styles.label}>
        {label}
      </Text>
      <TextInput
        {...props}
        ref={ref}
        placeholderTextColor={Colors.textMuted}
        selectionColor={Colors.primary}
        accessibilityLabel={props.accessibilityLabel ?? label}
        secureTextEntry={password || props.secureTextEntry}
        autoCorrect={false}
        style={[styles.input, error && styles.inputError, style]}
      />
      {error ? (
        <Text variant="small" color={Colors.danger}>
          {error}
        </Text>
      ) : hint ? (
        <Text variant="small" color={Colors.textMuted}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 6 },
  label: { fontFamily: Fonts.semibold },
  input: {
    minHeight: 52,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    color: Colors.text,
    fontFamily: Fonts.regular,
    fontSize: 16,
  },
  inputError: { borderColor: Colors.danger },
});
