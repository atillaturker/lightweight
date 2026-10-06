/**
 * Tests for the set table's inline draft state.
 *
 * These pin the behavior that made typed values disappear: the draft must
 * survive losing focus, an empty field must never overwrite a stored number
 * with zero, and moving from cell to cell must commit the cell being left
 * behind to its own set.
 */
import { act, renderHook } from '@testing-library/react-native';
import { Keyboard, type TextInput } from 'react-native';

import type { ActiveExercise, ActiveSet, FocusedCell } from '../../types';
import {
  EMPTY_CELL,
  firstIncompleteSet,
  listCells,
  nextCell,
  parseDraftValue,
  replaceSeed,
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

describe('useSetTableDraft first keystroke', () => {
  it('replaces a zero seed instead of appending to it', () => {
    const harness = renderDraft();

    act(() => harness.hook.focusCell(WEIGHT, 0));
    // The hidden input appends typed digits after the seeded "0".
    act(() => harness.hook.changeDraft('08'));
    expect(harness.hook.draftValue).toBe('8');
    act(() => harness.hook.changeDraft('85'));
    act(() => harness.hook.commit());

    expect(harness.writes).toEqual([{ cell: WEIGHT, value: 85 }]);
  });

  it('replaces a prefilled value from the last session', () => {
    const harness = renderDraft();

    act(() => harness.hook.focusCell(WEIGHT, 80));
    act(() => harness.hook.changeDraft('808'));

    expect(harness.hook.draftValue).toBe('8');
  });

  it('keeps editing normally after the first keystroke', () => {
    const harness = renderDraft();

    act(() => harness.hook.focusCell(REPS, 8));
    act(() => harness.hook.changeDraft('81'));
    act(() => harness.hook.changeDraft('12'));

    expect(harness.hook.draftValue).toBe('12');
  });
});

describe('useSetTableDraft keyboard focus', () => {
  /** Stand-in for the hidden TextInput that owns keyboard focus. */
  function attachInput(harness: DraftHarness, focused: boolean) {
    const input = {
      focus: jest.fn(),
      blur: jest.fn(),
      isFocused: jest.fn(() => focused),
    };
    harness.hook.inputRef.current = input as unknown as TextInput;
    return input;
  }

  it('re-raises the keyboard when the input kept focus after a dismissal', () => {
    const harness = renderDraft();
    const input = attachInput(harness, true);

    act(() => harness.hook.focusCell(WEIGHT, 20));

    expect(input.blur).toHaveBeenCalled();
    expect(input.focus).toHaveBeenCalled();
  });

  it('does not blur when moving between cells', () => {
    const harness = renderDraft();
    act(() => harness.hook.focusCell(WEIGHT, 20));
    const input = attachInput(harness, true);

    act(() => harness.hook.focusCell(REPS, 8));

    expect(input.blur).not.toHaveBeenCalled();
    expect(input.focus).toHaveBeenCalled();
  });

  it('commits and blurs when the system hides the keyboard', () => {
    let onHide: (() => void) | undefined;
    const spy = jest
      .spyOn(Keyboard, 'addListener')
      .mockImplementation((_event, listener) => {
        onHide = listener as () => void;
        return { remove: jest.fn() } as unknown as ReturnType<typeof Keyboard.addListener>;
      });
    const harness = renderDraft();
    const input = attachInput(harness, true);

    act(() => harness.hook.focusCell(WEIGHT, 20));
    act(() => harness.hook.changeDraft('2025'));
    act(() => onHide?.());

    expect(harness.writes).toEqual([{ cell: WEIGHT, value: 25 }]);
    expect(input.blur).toHaveBeenCalled();
    expect(harness.hook.focusedCell).toBeNull();
    spy.mockRestore();
  });
});

describe('useSetTableDraft RPE', () => {
  const RPE: FocusedCell = { setId: 'set-1', field: 'rpe' };

  it('starts an unrated RPE cell empty and shows a dash when idle', () => {
    const harness = renderDraft();

    expect(harness.hook.displayValue(RPE, undefined)).toBe(EMPTY_CELL);
    act(() => harness.hook.focusCell(RPE, undefined));
    expect(harness.hook.draftValue).toBe('');
  });

  it('commits a rating on the scale', () => {
    const harness = renderDraft();

    act(() => harness.hook.focusCell(RPE, undefined));
    act(() => harness.hook.changeDraft('8.5'));
    act(() => harness.hook.commit());

    expect(harness.writes).toEqual([{ cell: RPE, value: 8.5 }]);
  });

  it('drops a rating off the scale', () => {
    const harness = renderDraft();

    act(() => harness.hook.focusCell(RPE, undefined));
    act(() => harness.hook.changeDraft('11'));
    act(() => harness.hook.commit());

    expect(harness.writes).toEqual([]);
  });
});

describe('listCells', () => {
  const table = [makeExercise('bench', [makeSet('a', false)])];

  it('omits RPE cells unless the column is shown', () => {
    expect(listCells(table).map((cell) => cell.field)).toEqual(['weight', 'reps']);
    expect(listCells(table, true).map((cell) => cell.field)).toEqual([
      'weight',
      'reps',
      'rpe',
    ]);
  });

  it('advances from reps to RPE when the column is shown', () => {
    const reps: FocusedCell = { setId: 'a', field: 'reps' };
    expect(nextCell(table, reps, true)).toEqual({ setId: 'a', field: 'rpe' });
  });
});

describe('replaceSeed', () => {
  it('keeps only what was typed after the seed', () => {
    expect(replaceSeed('0', '085')).toBe('85');
  });

  it('keeps only what was typed before the seed', () => {
    expect(replaceSeed('80', '580')).toBe('5');
  });

  it('clears the field on a backspace into the seed', () => {
    expect(replaceSeed('80', '8')).toBe('');
    expect(replaceSeed('0', '')).toBe('');
  });

  it('passes through a full replacement', () => {
    expect(replaceSeed('20', '25')).toBe('25');
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

describe('parseDraftValue', () => {
  it('accepts RPE in half steps from 1 to 10 only', () => {
    expect(parseDraftValue('7.5', 'rpe')).toBe(7.5);
    expect(parseDraftValue('0', 'rpe')).toBeNull();
    expect(parseDraftValue('8.3', 'rpe')).toBeNull();
  });

  it('accepts zero weight for bodyweight sets', () => {
    expect(parseDraftValue('0', 'weight')).toBe(0);
  });

  it('accepts a fractional weight', () => {
    expect(parseDraftValue('62.5', 'weight')).toBe(62.5);
  });

  it('rejects zero reps', () => {
    expect(parseDraftValue('0', 'reps')).toBeNull();
  });

  it('rejects fractional reps', () => {
    expect(parseDraftValue('2.5', 'reps')).toBeNull();
  });

  it('accepts a whole number of reps', () => {
    expect(parseDraftValue('8', 'reps')).toBe(8);
  });
});

describe('useSetTableDraft reps validation', () => {
  it('keeps the stored reps when zero is typed', () => {
    const harness = renderDraft();

    act(() => harness.hook.focusCell(REPS, 8));
    act(() => harness.hook.changeDraft('0'));
    act(() => harness.hook.commit());

    expect(harness.writes).toEqual([]);
  });
});
