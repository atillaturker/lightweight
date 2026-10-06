import { heroTexts, recentSummaryText, recordValueText } from '../exerciseDetailFormat';

describe('heroTexts', () => {
  it('shows a longest hold as a clock with no unit', () => {
    const texts = heroTexts({ kind: 'timed', value: 75, delta: 15, source: null }, 'kg');
    expect(texts).toMatchObject({
      label: 'LONGEST HOLD',
      valueText: '1:15',
      unit: '',
      deltaText: '▲ 0:15 over 8 weeks',
      sourceText: null,
    });
  });

  it('shows most reps for a bodyweight exercise', () => {
    const texts = heroTexts({ kind: 'bodyweight', value: 15, delta: -2, source: null }, 'kg');
    expect(texts).toMatchObject({ label: 'MOST REPS', valueText: '15', unit: 'reps', deltaText: '▼ 2 reps over 8 weeks' });
  });

  it('shows e1RM with its source set', () => {
    const texts = heroTexts(
      { kind: 'load', value: 116.67, delta: null, source: { weightKg: 100, reps: 5 } },
      'kg',
    );
    expect(texts).toMatchObject({ label: 'ESTIMATED 1RM', valueText: '116.7', unit: 'kg', sourceText: 'From 100 kg × 5' });
  });
});

describe('row texts', () => {
  it('formats a longest-hold record', () => {
    const row = { type: 'longest_hold' as const, label: 'Longest hold', achievedAt: 1, weightKg: 0, reps: 0, seconds: 90 };
    expect(recordValueText(row, 'kg')).toBe('1:30');
  });

  it('formats recent timed and unloaded sessions', () => {
    const base = { sessionId: 's', startedAt: 1, weightKg: 0, reps: 12, sets: 3 };
    expect(recentSummaryText({ ...base, durationSec: 45 }, 'kg')).toBe('0:45 × 3');
    expect(recentSummaryText(base, 'kg')).toBe('12 reps × 3');
    expect(recentSummaryText({ ...base, weightKg: 80, reps: 8, sets: 1 }, 'kg')).toBe('80 kg × 8');
  });
});
