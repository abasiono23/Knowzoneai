import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, TextInput, View, type TextInputInstance } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';

import { Text } from '@/components/ui';
import { Colors, Fonts, Radius } from '@/constants/theme';

type Props = {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  error?: boolean;
  /** Bump this number to play the "wrong code" shake. */
  shakeKey?: number;
};

export function OtpInput({ value, onChange, length = 6, error, shakeKey = 0 }: Props) {
  const { t } = useTranslation('auth');
  const inputRef = useRef<TextInputInstance>(null);
  const [focused, setFocused] = useState(true);
  const shake = useSharedValue(0);

  useEffect(() => {
    if (shakeKey === 0) return;
    shake.value = withSequence(
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(-6, { duration: 50 }),
      withTiming(6, { duration: 50 }),
      withTiming(0, { duration: 50 }),
    );
  }, [shakeKey, shake]);
  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }] }));

  return (
    <Pressable onPress={() => inputRef.current?.focus()} accessibilityLabel={t('shared.verificationCode')}>
      <Animated.View style={[styles.row, shakeStyle]}>
        {Array.from({ length }, (_, i) => {
          const char = value[i] ?? '';
          const active = focused && i === Math.min(value.length, length - 1);
          return (
            <View
              key={i}
              style={[
                styles.cell,
                char && styles.filled,
                active && styles.active,
                error && { borderColor: Colors.danger, backgroundColor: Colors.dangerSoft },
              ]}>
              <Text style={styles.char}>{char}</Text>
            </View>
          );
        })}
      </Animated.View>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={(text) => onChange(text.replace(/\D/g, '').slice(0, length))}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
        maxLength={length}
        autoFocus
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={styles.hidden}
        caretHidden
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  cell: {
    flex: 1,
    maxWidth: 56,
    aspectRatio: 0.82,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filled: { borderColor: Colors.borderStrong, backgroundColor: Colors.surfaceRaised },
  active: {
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOpacity: 0.5,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  char: { fontFamily: Fonts.extrabold, fontSize: 26, lineHeight: 32, color: Colors.text },
  hidden: { position: 'absolute', opacity: 0, width: 1, height: 1 },
});
