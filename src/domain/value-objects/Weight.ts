import type { WeightUnit } from '../entities/User';

/** Pounds in one kilogram. */
const LB_PER_KG = 2.2046226218;

/**
 * Format a kilogram value for display, trimming a trailing ".0".
 * Kilogram values keep at most one decimal; pound values use one decimal.
 */
function formatAmount(value: number, decimals: number): string {
  const fixed = value.toFixed(decimals);
  return fixed.endsWith('.0') ? fixed.slice(0, -2) : fixed;
}

/**
 * Immutable weight value object.
 * Stores kilograms internally; all unit conversion happens here.
 */
export class Weight {
  private readonly kg: number;

  private constructor(kg: number) {
    this.kg = kg;
  }

  /**
   * Create a Weight from a kilogram value.
   * Throws if kg is negative.
   */
  static fromKg(kg: number): Weight {
    if (kg < 0) {
      throw new Error('Weight cannot be negative');
    }
    return new Weight(kg);
  }

  /**
   * Create a Weight from a pound value.
   * Throws if lb is negative.
   */
  static fromLb(lb: number): Weight {
    if (lb < 0) {
      throw new Error('Weight cannot be negative');
    }
    return new Weight(lb / LB_PER_KG);
  }

  /**
   * The weight in kilograms.
   */
  toKg(): number {
    return this.kg;
  }

  /**
   * The weight in pounds.
   */
  toLb(): number {
    return this.kg * LB_PER_KG;
  }

  /**
   * Format the weight for display in the requested unit,
   * e.g. "80 kg" or "176.4 lb".
   */
  format(unit: WeightUnit): string {
    return unit === 'kg'
      ? `${formatAmount(this.kg, 1)} kg`
      : `${formatAmount(this.toLb(), 1)} lb`;
  }
}
