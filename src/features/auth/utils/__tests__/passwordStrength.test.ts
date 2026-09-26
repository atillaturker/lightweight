import { calculatePasswordStrength } from '../passwordStrength';

describe('calculatePasswordStrength', () => {
  it('scores an empty password as zero', () => {
    expect(calculatePasswordStrength('')).toBe(0);
  });

  it('increases the score as criteria are met', () => {
    const weak = calculatePasswordStrength('abcdefg');
    const medium = calculatePasswordStrength('abcdefgh');
    const strong = calculatePasswordStrength('Abcdefg1!');

    expect(weak).toBeLessThan(medium);
    expect(medium).toBeLessThan(strong);
  });

  it('returns one for a password meeting every criterion', () => {
    expect(calculatePasswordStrength('Abcdefg1!')).toBe(1);
  });

  it('never exceeds one', () => {
    expect(calculatePasswordStrength('Abcdefg1!Abcdefg1!')).toBeLessThanOrEqual(
      1,
    );
  });
});
