/**
 * Corner radius scale. Maps to element hierarchy.
 * Do not invent intermediate values.
 */
export const radii = {
  /** Inputs, buttons, compact controls, segmented controls. */
  control: 8,
  /** Cards, module wells, metric panels. */
  card: 12,
  /** Larger feature containers, modals. */
  stage: 16,
  /** Badges, filters, segmented controls, pills. */
  pill: 9999,
} as const;

export type RadiusToken = keyof typeof radii;
