import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import Svg, { Defs, G, LinearGradient, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

import { Text } from '@/components/ui';
import { Colors, Fonts, Radius } from '@/constants/theme';

/**
 * The Knowzone mark: a rounded "K" whose upper arm launches into a gold AI spark.
 * Mirrors assets/brand/logo-mark.svg, the master used to render the app icons.
 */
export function LogoMark({ size = 96 }: { size?: number }) {
  // Unique gradient ids so several logos can render on one screen.
  const id = useId().replace(/:/g, '');
  const { t } = useTranslation('auth');
  return (
    <Svg width={size} height={size} viewBox="0 0 1024 1024" accessibilityLabel={t('brand.logo')}>
      <Defs>
        <LinearGradient id={`bg${id}`} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#5A3BFF" />
          <Stop offset="0.55" stopColor="#8E4DFF" />
          <Stop offset="1" stopColor="#B04CFF" />
        </LinearGradient>
        <RadialGradient id={`glow${id}`} cx="0.92" cy="0.95" r="0.75">
          <Stop offset="0" stopColor="#2DD4BF" stopOpacity="0.85" />
          <Stop offset="0.6" stopColor="#2DD4BF" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id={`shine${id}`} cx="0.2" cy="0.1" r="0.7">
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.28" />
          <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </RadialGradient>
        <LinearGradient id={`gold${id}`} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#FFE7A8" />
          <Stop offset="1" stopColor="#FFB627" />
        </LinearGradient>
      </Defs>
      <Rect width="1024" height="1024" rx="232" fill={`url(#bg${id})`} />
      <Rect width="1024" height="1024" rx="232" fill={`url(#glow${id})`} />
      <Rect width="1024" height="1024" rx="232" fill={`url(#shine${id})`} />
      <G transform="translate(-64 40)">
        <G fill="none" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" strokeWidth={124}>
          <Path d="M330 300 V724" />
          <Path d="M330 540 L585 345" />
          <Path d="M440 472 L680 724" />
        </G>
        <Path
          fill={`url(#gold${id})`}
          d="M742 150 C754 236 774 256 860 268 C774 280 754 300 742 386 C730 300 710 280 624 268 C710 256 730 236 742 150 Z"
        />
        <Path
          fill="#FFFFFF"
          fillOpacity={0.9}
          d="M860 400 C865 432 872 439 904 444 C872 449 865 456 860 488 C855 456 848 449 816 444 C848 439 855 432 860 400 Z"
        />
      </G>
    </Svg>
  );
}

/** "Knowzone" set in Manrope ExtraBold with the gold "AI" badge. */
export function Wordmark({ fontSize = 24 }: { fontSize?: number }) {
  return (
    // The brand reads left to right in every language, including Arabic.
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: fontSize * 0.3, direction: 'ltr' }}>
      <Text
        style={{ fontFamily: Fonts.extrabold, fontSize, lineHeight: fontSize * 1.2, letterSpacing: -fontSize * 0.03 }}>
        Knowzone
      </Text>
      <View
        style={{
          backgroundColor: Colors.reward,
          borderRadius: Radius.sm,
          paddingHorizontal: fontSize * 0.28,
          paddingVertical: fontSize * 0.04,
        }}>
        <Text
          style={{
            fontFamily: Fonts.extrabold,
            fontSize: fontSize * 0.62,
            lineHeight: fontSize * 0.85,
            color: Colors.onBright,
          }}>
          AI
        </Text>
      </View>
    </View>
  );
}

/** Mark + wordmark, for headers and the welcome screen. */
export function Logo({ size = 40, stacked = false }: { size?: number; stacked?: boolean }) {
  const fontSize = stacked ? size * 0.42 : size * 0.6;
  return (
    <View
      accessible
      accessibilityLabel="Knowzone AI"
      style={{
        flexDirection: stacked ? 'column' : 'row',
        alignItems: 'center',
        gap: stacked ? size * 0.2 : size * 0.25,
      }}>
      <LogoMark size={size} />
      <Wordmark fontSize={fontSize} />
    </View>
  );
}
