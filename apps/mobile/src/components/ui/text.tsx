import { useTranslation } from 'react-i18next';
import { Text as RNText, StyleSheet, type TextProps } from 'react-native';

import { Colors, Type, type TypeVariant } from '@/constants/theme';
import { ARABIC_FONT } from '@/i18n';
import { useTextScale } from '@/lib/appearance';

type Props = TextProps & {
  variant?: TypeVariant;
  color?: string;
  center?: boolean;
};

export function Text({ variant = 'body', color = Colors.text, center, style, ...rest }: Props) {
  const scale = useTextScale();
  const { i18n } = useTranslation();
  const arabic = i18n.language === 'ar';
  const base = [Type[variant], { color }, center && { textAlign: 'center' as const }, style];
  if (scale === 1 && !arabic) return <RNText style={base} {...rest} />;
  const flat = StyleSheet.flatten(base) ?? {};
  return (
    <RNText
      style={[
        flat,
        // Text size setting (screen 193): scale whatever size the final style ends up with.
        scale !== 1 && {
          fontSize: (flat.fontSize ?? 14) * scale,
          lineHeight: flat.lineHeight ? flat.lineHeight * scale : undefined,
        },
        // Arabic uses a font that has Arabic letters, in the same weight; it also needs more line height.
        arabic && {
          fontFamily: (flat.fontFamily && ARABIC_FONT[flat.fontFamily]) || flat.fontFamily,
          lineHeight: flat.lineHeight ? flat.lineHeight * scale * 1.15 : undefined,
          letterSpacing: 0,
        },
      ]}
      {...rest}
    />
  );
}
