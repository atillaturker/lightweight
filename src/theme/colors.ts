/**
 * Application Color Palette
 * Centralized color definitions for consistent theming
 */

export const colors = {
  // Background Colors
  background: {
    primary: "#14130f", // Based on design system
    secondary: "#23211a", // Cards and modal backgrounds
    tertiary: "#353228", // Inner cards or inputs
  },

  // Text Colors
  text: {
    primary: "#fefefe", // High contrast text
    secondary: "#d1cbb8", // Muted text
    tertiary: "#a39f91", // Subtle labels/icons
  },

  // Brand/Action Colors
  brand: {
    primary: "#f4d125", // Design system primary
    secondary: "#867737", // Design system secondary
    tertiary: "#778486", // Design system tertiary
  },

  // Neural Base
  neutral: {
    base: "#7c7768",
  },

  // UI Elements
  ui: {
    border: "rgba(124, 119, 104, 0.2)",
    divider: "rgba(124, 119, 104, 0.2)",
    placeholder: "#353228",
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
