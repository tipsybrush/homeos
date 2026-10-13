import { Platform } from 'react-native';

/**
 * HomeOS design tokens.
 *
 * Direction (Timi, 2026-10-13): dark mode, following iOS 26 Liquid Glass.
 * Colours follow Apple's dark-mode system palette so native glass surfaces
 * (tab bar, headers, GlassView) and our own components read as one system.
 * Keep every colour, radius and spacing value here, not in screens.
 */

export const colors = {
  // Canvas: near-black with a faint blue cast so glass has something to refract.
  background: '#05060A',
  backgroundElevated: '#0E1016',

  // Ambient glows painted behind content (see AmbientBackground).
  glowWarm: '#FF9F0A',
  glowCool: '#5E5CE6',
  glowTeal: '#40C8E0',

  // Glass fallbacks for platforms without Liquid Glass.
  glassFill: 'rgba(255,255,255,0.06)',
  glassFillStrong: 'rgba(255,255,255,0.10)',
  glassBorder: 'rgba(255,255,255,0.14)',
  glassHighlight: 'rgba(255,255,255,0.22)',

  // Text (iOS label colours, dark).
  text: '#F5F5F7',
  textSecondary: 'rgba(235,235,245,0.62)',
  textTertiary: 'rgba(235,235,245,0.38)',

  separator: 'rgba(84,84,88,0.55)',

  // iOS system colours (dark variants).
  accent: '#FF9F0A', // orange: keeps a little warmth from the original brief
  blue: '#0A84FF',
  green: '#30D158',
  yellow: '#FFD60A',
  red: '#FF453A',
  indigo: '#5E5CE6',
  teal: '#40C8E0',
  gray: '#8E8E93',
} as const;

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 28,
  xxl: 40,
} as const;

export const radius = {
  sm: 12,
  md: 20,
  lg: 28,
  pill: 999,
} as const;

/** iOS text styles (points). System font = SF Pro on iOS. */
export const type = {
  largeTitle: { fontSize: 34, lineHeight: 41, fontWeight: '700' },
  title1: { fontSize: 28, lineHeight: 34, fontWeight: '700' },
  title2: { fontSize: 22, lineHeight: 28, fontWeight: '600' },
  title3: { fontSize: 20, lineHeight: 25, fontWeight: '600' },
  headline: { fontSize: 17, lineHeight: 22, fontWeight: '600' },
  body: { fontSize: 17, lineHeight: 22, fontWeight: '400' },
  callout: { fontSize: 16, lineHeight: 21, fontWeight: '400' },
  subhead: { fontSize: 15, lineHeight: 20, fontWeight: '400' },
  footnote: { fontSize: 13, lineHeight: 18, fontWeight: '400' },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '500' },
} as const;

export type TextVariant = keyof typeof type;

/** Minimum comfortable touch target (Apple HIG). */
export const minTouch = 44;

/**
 * On web (a development preview only), native tabs and transparent headers
 * render at the top instead of floating, so content needs extra top room.
 */
export const webTopInset = Platform.OS === 'web' ? 76 : 0;
