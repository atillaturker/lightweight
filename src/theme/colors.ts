/**
 * Color tokens. Single source of truth for all colors in the app.
 * Never hard-code a hex value anywhere else.
 *
 * Every token has a light and a dark value (DESIGN.md §3 and §5). Code
 * never picks between them: it reads the active palette through
 * `useTheme()` or a `createStyles()` hook, and the theme supplies it.
 */

/** Which palette is active. */
export type ColorScheme = "light" | "dark";

export const lightColors = {
  // Surfaces
  canvas: "#FFFFFF",
  /** Floating surfaces: sheets, popovers, menus. */
  canvasRaised: "#FFFFFF",
  surface: "#F5F5F5",
  hairline: "#E5E7EB",

  // Brand
  primary: "#111111",
  primaryHover: "#262626",
  /** Text and icons drawn on a `primary` fill. */
  onPrimary: "#FFFFFF",
  accent: "#3B82F6",

  // Controls
  /** Selected segment of a segmented control. */
  controlSelected: "#FFFFFF",
  /** Toggle track when off; empty progress tracks. */
  trackOff: "#E5E7EB",

  // Text
  textPrimary: "#111111",
  textBody: "#374151",
  textMuted: "#6B7280",
  textDivider: "#D1D5DB",

  // State
  success: "#10B981",
  error: "#EF4444",
  /** "Close to limit" state (e.g. RPE 9–10). At most once per screen. */
  warning: "#F59E0B",

  // Overlay
  /** Dim layer behind a bottom sheet. */
  backdrop: "rgba(0,0,0,0.25)",
  /** The one shadow color, for floating elements only (DESIGN.md §7.3). */
  shadow: "rgba(0,0,0,0.04)",

  // Chart
  chartLine: "#111111",
  chartSeries2: "#9CA3AF",
  chartBarCurrent: "#111111",
  chartBarPrevious: "#E5E7EB",
  chartGrid: "#E5E7EB",
  chartHighlight: "#3B82F6",

  // Intensity scale: heatmaps, muscle map, histograms (none → most)
  intensity0: "#F5F5F5",
  intensity1: "#D4D4D4",
  intensity2: "#A3A3A3",
  intensity3: "#525252",
  intensity4: "#111111",
} as const;

/** A full palette: the same keys as the light one, any color values. */
export type ColorPalette = { readonly [K in keyof typeof lightColors]: string };

export type ColorToken = keyof ColorPalette;

/**
 * Dark palette. Near-black canvas (not pure black) so hairlines and wells
 * stay visible; off-white text to avoid halation; state colors one shade
 * lighter to keep 4.5:1 contrast. No shadows — floating elements separate
 * by `canvasRaised` plus a hairline instead.
 */
export const darkColors: ColorPalette = {
  canvas: "#0A0A0A",
  canvasRaised: "#161616",
  surface: "#1A1A1A",
  hairline: "#2A2A2A",

  primary: "#F5F5F5",
  primaryHover: "#D4D4D4",
  onPrimary: "#111111",
  accent: "#60A5FA",

  controlSelected: "#2E2E2E",
  trackOff: "#3A3A3A",

  textPrimary: "#F5F5F5",
  textBody: "#D1D5DB",
  textMuted: "#9CA3AF",
  textDivider: "#4B5563",

  success: "#34D399",
  error: "#F87171",
  warning: "#FBBF24",

  backdrop: "rgba(0,0,0,0.6)",
  shadow: "transparent",

  chartLine: "#F5F5F5",
  chartSeries2: "#6B7280",
  chartBarCurrent: "#F5F5F5",
  chartBarPrevious: "#2A2A2A",
  chartGrid: "#2A2A2A",
  chartHighlight: "#60A5FA",

  intensity0: "#1A1A1A",
  intensity1: "#333333",
  intensity2: "#575757",
  intensity3: "#A3A3A3",
  intensity4: "#F5F5F5",
};

/** Both palettes, keyed by scheme. */
export const palettes: Readonly<Record<ColorScheme, ColorPalette>> = {
  light: lightColors,
  dark: darkColors,
};
