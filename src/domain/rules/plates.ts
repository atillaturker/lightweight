import type { WeightUnit } from '../entities';

/**
 * Plate math for a barbell: which plates go on each side to reach a
 * total. Unit-agnostic — weights and plates are in the same unit, which
 * is the user's display unit, since gyms stock plates in one unit.
 */

/** Standard plates per unit, heaviest first. */
export const STANDARD_PLATES: Readonly<Record<WeightUnit, readonly number[]>> = {
  kg: [25, 20, 15, 10, 5, 2.5, 1.25],
  lb: [45, 35, 25, 10, 5, 2.5],
};

/** Common bar weights per unit; the first is the default. */
export const BAR_WEIGHTS: Readonly<Record<WeightUnit, readonly number[]>> = {
  kg: [20, 15, 10],
  lb: [45, 35, 25],
};

/** Plates for one side of the bar, and how close they get. */
export interface PlateLoad {
  /** Plates for each side, heaviest first. */
  perSide: number[];
  /** Total the bar actually carries: bar plus both sides. */
  loaded: number;
  /** Target minus loaded; above zero when no plate combination fits. */
  remainder: number;
}

/** Work in hundredths so 1.25 and 2.5 steps never drift. */
const SCALE = 100;

/**
 * Greedy plate breakdown for `target` on a `bar`, heaviest plates first.
 * A target at or below the bar loads no plates. Plates are unlimited.
 */
export function calculatePlates(
  target: number,
  bar: number,
  plates: readonly number[],
): PlateLoad {
  if (bar <= 0) throw new Error('bar must be positive');
  const sorted = [...plates].filter((plate) => plate > 0).sort((a, b) => b - a);
  let side = Math.max(0, Math.floor((Math.round(target * SCALE) - Math.round(bar * SCALE)) / 2));
  const perSide: number[] = [];
  for (const plate of sorted) {
    const scaled = Math.round(plate * SCALE);
    while (side >= scaled) {
      perSide.push(plate);
      side -= scaled;
    }
  }
  const loaded = bar + 2 * perSide.reduce((sum, plate) => sum + plate, 0);
  return { perSide, loaded, remainder: Math.round((target - loaded) * SCALE) / SCALE };
}
