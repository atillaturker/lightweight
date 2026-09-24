/**
 * Color tokens. Single source of truth for all colors in the app.
 * Never hard-code a hex value anywhere else.
 */
export const colors = {
  // Surfaces
  canvas: "#FFFFFF",
  surface: "#F5F5F5",
  hairline: "#E5E7EB",

  // Brand
  primary: "#111111",
  primaryHover: "#262626",
  accent: "#3B82F6",

  // Text
  textPrimary: "#111111",
  textBody: "#374151",
  textMuted: "#6B7280",
  textInverse: "#FFFFFF",
  textDivider: "#D1D5DB",

  // State
  success: "#10B981",
  error: "#EF4444",

  // Chart
  chartLine: "#111111",
  chartBarCurrent: "#111111",
  chartBarPrevious: "#E5E7EB",
  chartGrid: "#E5E7EB",
  chartHighlight: "#3B82F6",
} as const;

export type ColorToken = keyof typeof colors;
