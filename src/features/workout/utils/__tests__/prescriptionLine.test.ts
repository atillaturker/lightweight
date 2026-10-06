import { prescriptionLine } from '../prescriptionLine';

describe('prescriptionLine', () => {
  it('explains added weight in the user unit', () => {
    const p = { weightKg: 82.5, reps: 8, reason: 'progressed' as const, change: 2.5 };
    expect(prescriptionLine(p, 'kg')).toBe('Next · +2.5 kg: every rep hit last time');
    expect(prescriptionLine({ ...p, change: 2.26796 }, 'lb')).toBe('Next · +5 lb: every rep hit last time');
  });

  it('explains a deload', () => {
    const p = { weightKg: 90, reps: 8, reason: 'deload' as const, change: -10 };
    expect(prescriptionLine(p, 'kg')).toBe('Next · −10 kg deload: three sessions missed at this weight');
  });

  it('explains reps, seconds and holds', () => {
    expect(prescriptionLine({ weightKg: 0, reps: 10, reason: 'reps_up', change: 1 }, 'kg')).toBe(
      'Next · +1 rep: one more than your weakest set',
    );
    expect(prescriptionLine({ weightKg: 0, reps: 0, durationSec: 45, reason: 'hold_up', change: 5 }, 'kg')).toBe(
      'Next · +5 s: every set done last time',
    );
    expect(prescriptionLine({ weightKg: 0, reps: 0, reason: 'held', change: 0 }, 'kg', true)).toBe(
      'Next · same as last time: finish every set to move up',
    );
  });
});
