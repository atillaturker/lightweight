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

/**
 * Off-scale values kept so existing layouts stay pixel-identical. Each has
 * one job; use `spacing` for anything new.
 */
export const fineSpacing = {
  /** Between a title and the meta line stacked directly under it. */
  stack: 2,
  /** Between a numeric value and its unit suffix. */
  unit: 3,
  /** Between an icon and its label, or a meta row and the title above. */
  tight: 6,
  /** Horizontal padding inside a pill chip; wordmark offset from its logo. */
  loose: 14,
} as const;

/** Vertical padding around an empty state. */
export const emptyStatePadding = 48;

export type SpacingToken = keyof typeof spacing;
