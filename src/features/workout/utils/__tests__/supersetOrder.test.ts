import type { ActiveExercise, ActiveSet } from '../../types';
import { logicalSetOrder, shouldRestAfter } from '../supersetOrder';

function sets(prefix: string, count: number, completed = 0): ActiveSet[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `${prefix}${index + 1}`,
    weightKg: 20,
    reps: 10,
    type: 'normal' as const,
    completed: index < completed,
    completedAt: index < completed ? 1 : null,
    isPR: false,
  }));
}

function block(id: string, setList: ActiveSet[], supersetGroup?: string): ActiveExercise {
  return {
    exerciseId: id,
    name: id,
    pictogramId: '',
    order: 0,
    sets: setList,
    ...(supersetGroup === undefined ? {} : { supersetGroup }),
  };
}

const ids = (exercises: ActiveExercise[]) => logicalSetOrder(exercises).map((ref) => ref.setId);

describe('logicalSetOrder', () => {
  it('logs plain blocks set by set', () => {
    expect(ids([block('a', sets('a', 2)), block('b', sets('b', 1))])).toEqual(['a1', 'a2', 'b1']);
  });

  it('logs a superset round by round', () => {
    const table = [block('a', sets('a', 2), 'A'), block('b', sets('b', 2), 'A'), block('c', sets('c', 1))];
    expect(ids(table)).toEqual(['a1', 'b1', 'a2', 'b2', 'c1']);
  });

  it('handles members with different set counts', () => {
    const table = [block('a', sets('a', 3), 'A'), block('b', sets('b', 1), 'A')];
    expect(ids(table)).toEqual(['a1', 'b1', 'a2', 'a3']);
  });
});

describe('shouldRestAfter', () => {
  it('always rests after a set outside a superset', () => {
    expect(shouldRestAfter([block('a', sets('a', 2))], 'a1')).toBe(true);
  });

  it('skips rest between superset members within a round', () => {
    const table = [block('a', sets('a', 2), 'A'), block('b', sets('b', 2), 'A')];
    expect(shouldRestAfter(table, 'a1')).toBe(false);
  });

  it('rests after the last member of a round', () => {
    const table = [block('a', sets('a', 2, 1), 'A'), block('b', sets('b', 2), 'A')];
    expect(shouldRestAfter(table, 'b1')).toBe(true);
  });

  it('rests when the remaining member has no set left in the round', () => {
    const table = [block('a', sets('a', 3, 1), 'A'), block('b', sets('b', 1, 1), 'A')];
    expect(shouldRestAfter(table, 'a2')).toBe(true);
  });
});
