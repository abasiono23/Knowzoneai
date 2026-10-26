import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Platform, Pressable, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { Text } from '@/components/ui';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';

export function GoogleG({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Path
        fill="#FFC107"
        d="M43.6 20.1H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z"
      />
      <Path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
      />
      <Path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"
      />
      <Path
        fill="#1976D2"
        d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z"
      />
    </Svg>
  );
}

type ButtonProps = { onPress: () => void; loading?: boolean; label?: string };

function SocialButton({
  onPress,
  loading,
  label,
  icon,
  dark,
}: ButtonProps & { icon: React.ReactNode; dark?: boolean }) {
  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        onPress();
      }}
      disabled={loading}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.button,
        dark ? styles.dark : styles.light,
        { transform: [{ scale: pressed ? 0.98 : 1 }], opacity: loading ? 0.7 : 1 },
      ]}>
      <View style={styles.icon}>{loading ? <ActivityIndicator color={dark ? '#fff' : '#111'} /> : icon}</View>
      <Text style={[styles.label, { color: dark ? Colors.text : '#14161F' }]}>{label}</Text>
      <View style={styles.icon} />
    </Pressable>
  );
}

export function GoogleButton({ label, ...props }: ButtonProps) {
  const { t } = useTranslation('auth');
  return <SocialButton {...props} label={label ?? t('shared.continueWithGoogle')} icon={<GoogleG />} />;
}

export function AppleButton({ label, ...props }: ButtonProps) {
  const { t } = useTranslation('auth');
  return (
    <SocialButton
      {...props}
      label={label ?? t('shared.continueWithApple')}
      dark
      icon={<Ionicons name="logo-apple" size={22} color="#fff" />}
    />
  );
}

/** Apple requires Sign in with Apple wherever other social logins are offered on iOS. */
export const showAppleSignIn = Platform.OS === 'ios' || Platform.OS === 'web';

export function OrDivider({ label }: { label?: string }) {
  const { t } = useTranslation('auth');
  return (
    <View style={styles.divider}>
      <View style={styles.line} />
      <Text variant="small" color={Colors.textMuted}>
        {label ?? t('shared.or')}
      </Text>
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 54,
    borderRadius: Radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
  },
  light: { backgroundColor: '#FFFFFF' },
  dark: { backgroundColor: '#000000', borderWidth: 1, borderColor: Colors.borderStrong },
  icon: { width: 24, alignItems: 'center' },
  label: { flex: 1, textAlign: 'center', fontFamily: Fonts.bold, fontSize: 16 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  line: { flex: 1, height: 1, backgroundColor: Colors.border },
});
