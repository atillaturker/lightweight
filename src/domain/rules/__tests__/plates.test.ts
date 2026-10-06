import { calculatePlates, STANDARD_PLATES } from '../plates';

describe('calculatePlates', () => {
  it('loads the heaviest plates first', () => {
    expect(calculatePlates(100, 20, STANDARD_PLATES.kg)).toEqual({
      perSide: [25, 15],
      loaded: 100,
      remainder: 0,
    });
  });

  it('uses fractional plates without drifting', () => {
    expect(calculatePlates(62.5, 20, STANDARD_PLATES.kg).perSide).toEqual([20, 1.25]);
  });

  it('repeats a plate when needed', () => {
    expect(calculatePlates(225, 45, STANDARD_PLATES.lb).perSide).toEqual([45, 45]);
  });

  it('reports what cannot be loaded', () => {
    expect(calculatePlates(101, 20, STANDARD_PLATES.kg)).toEqual({
      perSide: [25, 15],
      loaded: 100,
      remainder: 1,
    });
  });

  it('loads no plates at or below the bar', () => {
    expect(calculatePlates(15, 20, STANDARD_PLATES.kg)).toEqual({
      perSide: [],
      loaded: 20,
      remainder: -5,
    });
  });

  it('rejects a bar without weight', () => {
    expect(() => calculatePlates(60, 0, STANDARD_PLATES.kg)).toThrow('bar must be positive');
  });
});
