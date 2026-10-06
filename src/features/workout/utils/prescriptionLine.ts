/**
 * The line under an exercise title that explains its progression target,
 * so a heavier bar never appears without a reason.
 */
import type { WeightUnit } from '@domain/entities';
import type { Prescription } from '@domain/rules';
import { Weight } from '@domain/value-objects';
import { formatDecimal } from '@lib/format';

/** A kg amount in the user's unit, e.g. `2.5 kg` or `5 lb`. */
function weightText(kg: number, unit: WeightUnit): string {
  const weight = Weight.fromKg(Math.abs(kg));
  return `${formatDecimal(unit === 'kg' ? weight.toKg() : weight.toLb(), 1)} ${unit}`;
}

/**
 * `Next · +2.5 kg: every rep hit last time`, and so on per reason. Timed
 * exercises speak of sets done rather than reps hit.
 */
export function prescriptionLine(
  prescription: Prescription,
  unit: WeightUnit,
  timed = false,
): string {
  const { change } = prescription;
  switch (prescription.reason) {
    case 'progressed':
      return `Next · +${weightText(change, unit)}: every rep hit last time`;
    case 'reps_up':
      return `Next · +${change} ${change === 1 ? 'rep' : 'reps'}: one more than your weakest set`;
    case 'hold_up':
      return `Next · +${change} s: every set done last time`;
    case 'held':
      return timed
        ? 'Next · same as last time: finish every set to move up'
        : 'Next · same as last time: hit every rep to move up';
    case 'deload':
      return `Next · −${weightText(change, unit)} deload: three sessions missed at this weight`;
  }
}
