import { Platform, useWindowDimensions } from 'react-native';

/** From this width the web version shows the computer layout: a sidebar instead of the bottom tab bar. */
export const DESKTOP_WIDTH = 1024;

/** True on the web at computer width. Phones, tablets in portrait and the native app keep the mobile layout. */
export function useDesktop() {
  const { width } = useWindowDimensions();
  return Platform.OS === 'web' && width >= DESKTOP_WIDTH;
}
