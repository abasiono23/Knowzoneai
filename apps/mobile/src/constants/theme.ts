import { Platform, type TextStyle } from 'react-native';

/**
 * Knowzone design tokens — "Open Book".
 *
 * White pages with a soft purple open book behind the content; white cards with light lavender
 * borders and dark navy text. Purple stays the accent (learning/AI and primary actions), teal for
 * mastery, gold for rewards.
 *
 * Rules of colour:
 *  - Purple  = AI and primary actions ("Create with AI", buttons, focus).
 *  - Teal    = learning progress, correct answers, mastery.
 *  - Gold    = rewards only (XP, coins, badges, level-ups). Never for actions.
 *  - Coral   = streaks and errors. Used sparingly.
 */

export const Palette = {
  navy950: '#070B1F',
  navy900: '#0B1026',
  navy800: '#121838',
  navy700: '#1A2150',
  navy600: '#262E66',

  purple600: '#6A45FF',
  purple500: '#7C5CFF',
  purple400: '#9B82FF',
  purple300: '#C3B5FF',

  teal500: '#14C8B4',
  teal400: '#2DD4BF',
  teal300: '#7CEBDD',

  gold500: '#FFB627',
  gold400: '#FFC857',
  gold300: '#FFDE99',

  coral500: '#FF5A7A',
  coral400: '#FF7A93',

  sky400: '#4CC9FF',

  white: '#FFFFFF',
} as const;

export const Colors = {
  background: Palette.white,
  backgroundDeep: '#F4F1FF',
  surface: Palette.white,
  surfaceRaised: '#F4F1FF',
  border: 'rgba(124, 92, 255, 0.16)',
  borderStrong: 'rgba(124, 92, 255, 0.32)',

  text: '#1B1F3B',
  textSecondary: '#4A5078',
  textMuted: '#868BAE',
  textOnAccent: Palette.white,
  /** Dark ink for bright badges and pills (gold, teal, white). */
  onBright: '#1B1F3B',

  primary: Palette.purple500,
  primaryPressed: Palette.purple600,
  primarySoft: 'rgba(124, 92, 255, 0.10)',

  success: '#0F9F8A',
  successSoft: 'rgba(20, 200, 180, 0.12)',

  reward: '#D99000',
  rewardSoft: 'rgba(255, 182, 39, 0.14)',

  danger: '#E5486A',
  dangerSoft: 'rgba(255, 90, 122, 0.10)',

  info: '#1C93D1',
} as const;

/** Gradients are reserved for hero moments: the AI button, level-ups, world cards. */
export const Gradients = {
  ai: [Palette.purple500, '#B04CFF'] as const,
  aiGlow: [Palette.purple600, Palette.teal500] as const,
  mastery: [Palette.teal500, Palette.sky400] as const,
  reward: [Palette.gold400, '#FF9F43'] as const,
  streak: ['#FF9F43', Palette.coral500] as const,
  screen: [Palette.white, Palette.white, '#F8F6FF'] as const,
};

/** Themed worlds in Knowzone World — each gets its own signature gradient. */
export const WorldGradients = {
  space: ['#3B2DBF', '#7C5CFF'] as const,
  nature: ['#0E8F6E', '#2DD4BF'] as const,
  art: ['#D9467A', '#FF9F43'] as const,
  history: ['#9C6B1E', '#FFC857'] as const,
  code: ['#1663C7', '#4CC9FF'] as const,
  math: ['#5B2BB8', '#C26BFF'] as const,
  language: ['#0F7C9C', '#7CEBDD'] as const,
};

export const Fonts = {
  regular: 'Manrope_500Medium',
  semibold: 'Manrope_600SemiBold',
  bold: 'Manrope_700Bold',
  extrabold: 'Manrope_800ExtraBold',
} as const;

export const Type = {
  display: { fontFamily: Fonts.extrabold, fontSize: 32, lineHeight: 38, letterSpacing: -0.6 },
  title: { fontFamily: Fonts.extrabold, fontSize: 24, lineHeight: 30, letterSpacing: -0.4 },
  heading: { fontFamily: Fonts.bold, fontSize: 18, lineHeight: 24, letterSpacing: -0.2 },
  body: { fontFamily: Fonts.regular, fontSize: 16, lineHeight: 24 },
  bodyStrong: { fontFamily: Fonts.semibold, fontSize: 16, lineHeight: 24 },
  small: { fontFamily: Fonts.regular, fontSize: 14, lineHeight: 20 },
  label: { fontFamily: Fonts.bold, fontSize: 12, lineHeight: 16, letterSpacing: 0.6 },
} as const;

export type TypeVariant = keyof typeof Type;

export const Spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const Radius = {
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
  pill: 999,
} as const;

export const MaxContentWidth = 720;
export const TabBarHeight = 84;

/** Removes the browser's default focus outline on web text inputs; our own focus styles replace it. */
// RN's types only allow solid/dotted/dashed, but react-native-web forwards 'none' to CSS.
export const NoWebOutline: TextStyle = Platform.OS === 'web' ? ({ outlineStyle: 'none' } as unknown as TextStyle) : {};
