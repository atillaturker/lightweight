/**
 * Spacing scale. Every margin, padding, and gap uses one of these.
 * Values off this scale are forbidden.
 */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
  giant: 56,
} as const;

/** Standard content gutter from screen edges. */
export const gutter = 20;

export type SpacingToken = keyof typeof spacing;
