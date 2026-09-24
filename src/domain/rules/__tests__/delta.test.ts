import { calculateDelta } from '../delta';

describe('calculateDelta', () => {
  it('returns null when previous is 0', () => {
    expect(calculateDelta(50, 0)).toBeNull();
  });

  it('returns null when previous is negative', () => {
    expect(calculateDelta(50, -10)).toBeNull();
  });

  it('computes a positive delta', () => {
    expect(calculateDelta(120, 100)).toBeCloseTo(20, 6);
  });

  it('computes a negative delta', () => {
    expect(calculateDelta(80, 100)).toBeCloseTo(-20, 6);
  });

  it('returns 0 when current equals previous', () => {
    expect(calculateDelta(100, 100)).toBe(0);
  });
});
