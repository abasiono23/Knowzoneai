import { LinearGradient as ExpoLinearGradient, type LinearGradientProps } from 'expo-linear-gradient';
import { createContext, useContext } from 'react';

/**
 * Text colour for whatever sits on a coloured surface. Pages are white with dark text, but text on a
 * purple, teal or other strong gradient card should be white: the gradient below tells the Text inside
 * it which to use, so cards don't each have to.
 */
export const InkContext = createContext<string | null>(null);
export const useInk = () => useContext(InkContext);

/** Relative luminance (0 dark … 1 light) of "#rgb", "#rrggbb" or "rgba(r, g, b, a)"; null when unknown or see-through. */
function luminance(color: string): number | null {
  let r: number, g: number, b: number;
  const rgba = color.match(/rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)(?:[\s,/]+([\d.]+))?/i);
  if (rgba) {
    if (rgba[4] !== undefined && Number(rgba[4]) < 0.5) return null;
    [r, g, b] = [Number(rgba[1]), Number(rgba[2]), Number(rgba[3])];
  } else {
    const hex = color.replace('#', '');
    if (!/^[0-9a-f]{3}([0-9a-f]{3})?$/i.test(hex)) return null;
    const full = hex.length === 3 ? [...hex].map((c) => c + c).join('') : hex;
    [r, g, b] = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16)) as [number, number, number];
  }
  const lin = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/** White text on dark or strong colours (purple, teal, blue, deep pink…); dark text on pale ones. */
export function inkFor(colors: readonly string[]) {
  const known = colors.map(luminance).filter((l): l is number => l !== null);
  if (!known.length) return null;
  const avg = known.reduce((a, b) => a + b, 0) / known.length;
  return avg < 0.45 ? '#FFFFFF' : null;
}

/** expo-linear-gradient, plus the right default text colour for what's drawn on it. */
export function LinearGradient(props: LinearGradientProps) {
  const ink = inkFor(props.colors as readonly string[]);
  return (
    <InkContext.Provider value={ink}>
      <ExpoLinearGradient {...props} />
    </InkContext.Provider>
  );
}
