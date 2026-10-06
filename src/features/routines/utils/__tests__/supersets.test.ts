import type { RoutineExercise } from '@domain/entities';

import {
  linkWithNext,
  normalizeSupersets,
  supersetLabels,
  unlinkFromSuperset,
} from '../supersets';

function slot(exerciseId: string, supersetGroup?: string): RoutineExercise {
  return {
    exerciseId,
    targetSets: 3,
    targetReps: 8,
    order: 0,
    ...(supersetGroup === undefined ? {} : { supersetGroup }),
  };
}

const groups = (slots: RoutineExercise[]) => slots.map((s) => s.supersetGroup ?? '-');

describe('normalizeSupersets', () => {
  it('relabels runs A, B in order and clears lone members', () => {
    const result = normalizeSupersets([slot('a', 'x'), slot('b', 'x'), slot('c', 'y'), slot('d', 'z'), slot('e', 'z')]);
    expect(groups(result)).toEqual(['A', 'A', '-', 'B', 'B']);
  });

  it('splits a group that is no longer contiguous', () => {
    const result = normalizeSupersets([slot('a', 'A'), slot('b'), slot('c', 'A')]);
    expect(groups(result)).toEqual(['-', '-', '-']);
  });
});

describe('linkWithNext', () => {
  it('pairs a slot with the next one', () => {
    expect(groups(linkWithNext([slot('a'), slot('b'), slot('c')], 'a'))).toEqual(['A', 'A', '-']);
  });

  it('extends an existing superset', () => {
    const pair = linkWithNext([slot('a'), slot('b'), slot('c')], 'a');
    expect(groups(linkWithNext(pair, 'b'))).toEqual(['A', 'A', 'A']);
  });

  it('does nothing for the last slot', () => {
    const slots = [slot('a'), slot('b')];
    expect(linkWithNext(slots, 'b')).toBe(slots);
  });
});

describe('unlinkFromSuperset', () => {
  it('removes one member and keeps the rest grouped', () => {
    const tri = [slot('a', 'A'), slot('b', 'A'), slot('c', 'A')];
    expect(groups(unlinkFromSuperset(tri, 'c'))).toEqual(['A', 'A', '-']);
  });

  it('dissolves a pair', () => {
    expect(groups(unlinkFromSuperset([slot('a', 'A'), slot('b', 'A')], 'a'))).toEqual(['-', '-']);
  });
});

describe('supersetLabels', () => {
  it('numbers members within each group', () => {
    const labels = supersetLabels([slot('a', 'A'), slot('b', 'A'), slot('c'), slot('d', 'B'), slot('e', 'B')]);
    expect(Object.fromEntries(labels)).toEqual({ a: 'A1', b: 'A2', d: 'B1', e: 'B2' });
  });
});
