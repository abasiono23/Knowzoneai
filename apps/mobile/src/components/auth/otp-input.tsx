import { useTranslation } from 'react-i18next';
import { StyleSheet, TextInput } from 'react-native';

import { Colors, Fonts, NoWebOutline, Radius } from '@/constants/theme';

type Props = {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  error?: boolean;
  /** Kept for callers; the field no longer animates (a plain text field is most reliable on Android). */
  shakeKey?: number;
};

/** The emailed code: one plain, visible number field (digits only). */
export function OtpInput({ value, onChange, length = 6, error }: Props) {
  const { t } = useTranslation('auth');
  return (
    <TextInput
      value={value}
      onChangeText={(text) => onChange(text.replace(/\D/g, '').slice(0, length))}
      keyboardType="number-pad"
      textContentType="oneTimeCode"
      autoComplete="one-time-code"
      maxLength={length}
      placeholder={'•'.repeat(length)}
      placeholderTextColor={Colors.textMuted}
      selectionColor={Colors.primary}
      accessibilityLabel={t('shared.verificationCode')}
      style={[styles.input, error && { borderColor: Colors.danger, backgroundColor: Colors.dangerSoft }]}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    minHeight: 64,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    color: Colors.text,
    ...NoWebOutline,
    fontFamily: Fonts.extrabold,
    fontSize: 28,
    letterSpacing: 10,
    textAlign: 'center',
  },
});
