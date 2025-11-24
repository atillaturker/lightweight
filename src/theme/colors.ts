/**
 * Application Color Palette
 * Centralized color definitions for consistent theming
 */

export const colors = {
  // Background Colors
  background: {
    primary: "#101922",
    secondary: "#18212D",
    tertiary: "#1F2937",
  },

  // Text Colors
  text: {
    primary: "#FFFFFF",
    secondary: "#6B7281",
    tertiary: "#9CA3AF",
  },

  // Brand/Action Colors
  brand: {
    primary: "#137FEC",
    secondary: "#1D5DB",
  },

  // UI Elements
  ui: {
    border: "#374151",
    divider: "#374151",
    placeholder: "#1F2937",
  },

  semantic: {
    success: "#10B981",
    error: "#EF4444",
    warning: "#F59E0B",
    info: "#3B82F6",
  },

  // Social Login (Optional)
  social: {
    google: "#FFFFFF",
    apple: "#000000",
    facebook: "#1877F2",
  },
} as const;

export type ColorPalette = typeof colors;
