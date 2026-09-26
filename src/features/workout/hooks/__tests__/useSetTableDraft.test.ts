/**
 * Tests for the set table's inline draft state.
 *
 * These pin the behavior that made typed values disappear: the draft must
 * survive losing focus, an empty field must never overwrite a stored number
 * with zero, and moving from cell to cell must commit the cell being left
 * behind to its own set.
 */
import { act, renderHook } from '@testing-library/react-native';

import type { ActiveExercise, ActiveSet, FocusedCell } from '../../types';
import {
  firstIncompleteSet,
  nextCell,
  useSetTableDraft,
  type SetTableDraft,
} from '../useSetTableDraft';

/** Build a set with only the fields the table helpers read. */
function makeSet(id: string, completed: boolean): ActiveSet {
  return {
    id,
    weightKg: 0,
    reps: 8,
    type: 'normal',
    completed,
    completedAt: null,
    isPR: false,
  };
}

/** Build an exercise block from its sets. */
function makeExercise(exerciseId: string, sets: ActiveSet[]): ActiveExercise {
  return {
    exerciseId,
    name: exerciseId,
    pictogramId: exerciseId,
    order: 0,
    sets,
  };
}

/** One committed write, as the write path would have received it. */
interface Write {
  cell: FocusedCell;
  value: number;
}

/**
 * A rendered draft hook plus the writes it has produced. The hook is read
 * through a getter so every access sees the latest render.
 */
interface DraftHarness {
  writes: Write[];
  readonly hook: SetTableDraft;
}

/** Render the hook with a recorder standing in for the store write. */
function renderDraft(): DraftHarness {
  const writes: Write[] = [];
  const { result } = renderHook(() =>
    useSetTableDraft((cell, value) => writes.push({ cell, value })),
  );
  return {
    writes,
    get hook() {
      return result.current;
    },
  };
}

const WEIGHT: FocusedCell = { setId: 'set-1', field: 'weight' };
const REPS: FocusedCell = { setId: 'set-1', field: 'reps' };
const NEXT_WEIGHT: FocusedCell = { setId: 'set-2', field: 'weight' };

describe('useSetTableDraft', () => {
  it('commits the typed value on commit', () => {
    const harness = renderDraft();

    act(() => harness.hook.focusCell(WEIGHT, 20));
    act(() => harness.hook.changeDraft('25'));
    act(() => harness.hook.commit());

    expect(harness.writes).toEqual([{ cell: WEIGHT, value: 25 }]);
  });

  it('does not zero a stored value when the field is cleared', () => {
    const harness = renderDraft();

    act(() => harness.hook.focusCell(WEIGHT, 20));
    act(() => harness.hook.changeDraft(''));
    act(() => harness.hook.commit());

    expect(harness.writes).toEqual([]);
  });

  it('commits the cell being left behind when another cell is focused', () => {
    const harness = renderDraft();

    act(() => harness.hook.focusCell(WEIGHT, 20));
    act(() => harness.hook.changeDraft('25'));
    act(() => harness.hook.focusCell(REPS, 8));

    expect(harness.writes).toEqual([{ cell: WEIGHT, value: 25 }]);
  });

  it('commits each cell to its own set when taps move down the table', () => {
    const harness = renderDraft();

    act(() => harness.hook.focusCell(REPS, 8));
    act(() => harness.hook.changeDraft('10'));
    act(() => harness.hook.focusCell(NEXT_WEIGHT, 60));
    act(() => harness.hook.changeDraft('62.5'));
    act(() => harness.hook.commit());

    expect(harness.writes).toEqual([
      { cell: REPS, value: 10 },
      { cell: NEXT_WEIGHT, value: 62.5 },
    ]);
  });

  it('shows the draft while focused and the stored value otherwise', () => {
    const harness = renderDraft();

    act(() => harness.hook.focusCell(WEIGHT, 20));
    act(() => harness.hook.changeDraft('25'));

    expect(harness.hook.displayValue(WEIGHT, 20)).toBe('25');
    expect(harness.hook.displayValue(REPS, 8)).toBe('8');
  });

  it('reports the focused cell while a cell is drafted', () => {
    const harness = renderDraft();

    act(() => harness.hook.focusCell(WEIGHT, 20));
    expect(harness.hook.focusedCell).toEqual(WEIGHT);
    expect(harness.hook.isKeyboardOpen).toBe(true);

    act(() => harness.hook.commit());
    expect(harness.hook.focusedCell).toBeNull();
    expect(harness.hook.isKeyboardOpen).toBe(false);
  });

  it('drops the draft on cancel without writing', () => {
    const harness = renderDraft();

    act(() => harness.hook.focusCell(WEIGHT, 20));
    act(() => harness.hook.changeDraft('25'));
    act(() => harness.hook.cancel());

    expect(harness.writes).toEqual([]);
    expect(harness.hook.focusedCell).toBeNull();
  });
});

describe('firstIncompleteSet', () => {
  it('returns null when every set is complete', () => {
    const exercises = [
      makeExercise('bench', [makeSet('b1', true), makeSet('b2', true)]),
      makeExercise('row', [makeSet('r1', true)]),
    ];

    expect(firstIncompleteSet(exercises)).toBeNull();
  });

  it('targets the first incomplete set when none is focused', () => {
    const exercises = [
      makeExercise('bench', [makeSet('b1', true), makeSet('b2', true)]),
      makeExercise('row', [makeSet('r1', false), makeSet('r2', false)]),
    ];

    expect(firstIncompleteSet(exercises)).toEqual({
      exerciseId: 'row',
      setId: 'r1',
    });
  });

  it('stays within an earlier exercise before a later one', () => {
    const exercises = [
      makeExercise('bench', [makeSet('b1', true), makeSet('b2', false)]),
      makeExercise('row', [makeSet('r1', false)]),
    ];

    expect(firstIncompleteSet(exercises)).toEqual({
      exerciseId: 'bench',
      setId: 'b2',
    });
  });

  it('returns null for an empty table', () => {
    expect(firstIncompleteSet([])).toBeNull();
  });
});

describe('nextCell', () => {
  it('advances from the last cell of one exercise to the first of the next', () => {
    const exercises = [
      makeExercise('bench', [makeSet('b1', false)]),
      makeExercise('row', [makeSet('r1', false)]),
    ];

    expect(nextCell(exercises, { setId: 'b1', field: 'reps' })).toEqual({
      setId: 'r1',
      field: 'weight',
    });
  });

  it('returns null after the last cell of the table', () => {
    const exercises = [makeExercise('bench', [makeSet('b1', false)])];

    expect(nextCell(exercises, { setId: 'b1', field: 'reps' })).toBeNull();
  });
});
