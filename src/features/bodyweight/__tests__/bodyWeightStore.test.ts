import { parseWeightInput } from '../components/LogWeightSheet';
import { useBodyWeightStore } from '../store';

const DAY = new Date(2024, 3, 16, 8).getTime();

beforeEach(() => useBodyWeightStore.setState({ entries: [] }));

describe('useBodyWeightStore', () => {
  it('keeps one entry per day, replacing a second log', () => {
    useBodyWeightStore.getState().logWeight(80, DAY);
    useBodyWeightStore.getState().logWeight(79.6, DAY + 60_000);

    expect(useBodyWeightStore.getState().entries).toEqual([
      { date: '2024-04-16', weightKg: 79.6, updatedAt: DAY + 60_000 },
    ]);
  });

  it('turns a removal into a newer tombstone', () => {
    useBodyWeightStore.getState().logWeight(80, DAY);

    const tombstone = useBodyWeightStore.getState().removeEntry('2024-04-16', DAY + 5);

    expect(tombstone).toMatchObject({ deleted: true, updatedAt: DAY + 5 });
    expect(useBodyWeightStore.getState().removeEntry('2024-04-16')).toBeNull();
  });
});

describe('parseWeightInput', () => {
  it('reads kg and lb, with a comma or point', () => {
    expect(parseWeightInput('80,5', 'kg')).toBe(80.5);
    expect(parseWeightInput('176', 'lb')).toBeCloseTo(79.83, 2);
  });

  it('rejects empty and implausible values', () => {
    expect(parseWeightInput('', 'kg')).toBeNull();
    expect(parseWeightInput('8', 'kg')).toBeNull();
    expect(parseWeightInput('abc', 'kg')).toBeNull();
  });
});
