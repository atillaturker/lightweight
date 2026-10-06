import type { Routine } from '@domain/entities';

import { routineAfter } from '../routineSelection';

/** A routine with only the fields rotation reads. */
function routine(id: string, isArchived = false): Routine {
  return {
    id,
    name: id,
    exercises: [],
    createdAt: 0,
    updatedAt: 0,
    isArchived,
  };
}

describe('routineAfter', () => {
  const push = routine('push');
  const pull = routine('pull');
  const legs = routine('legs');

  it('returns the next routine in list order', () => {
    expect(routineAfter([push, pull, legs], 'push')?.id).toBe('pull');
  });

  it('wraps from the last routine to the first', () => {
    expect(routineAfter([push, pull, legs], 'legs')?.id).toBe('push');
  });

  it('skips archived routines', () => {
    expect(routineAfter([push, routine('pull', true), legs], 'push')?.id).toBe('legs');
  });

  it('rotates past an archived routine that was just trained', () => {
    expect(routineAfter([push, routine('pull', true), legs], 'pull')?.id).toBe('legs');
  });

  it('returns the same routine when it is the only one', () => {
    expect(routineAfter([push], 'push')?.id).toBe('push');
  });

  it('returns null when the trained routine was deleted', () => {
    expect(routineAfter([push, pull], 'legs')).toBeNull();
  });

  it('returns null when every routine is archived', () => {
    expect(routineAfter([routine('push', true)], 'push')).toBeNull();
  });
});
