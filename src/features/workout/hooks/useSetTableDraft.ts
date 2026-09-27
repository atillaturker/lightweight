/**
 * Inline editing state for the set table.
 *
 * The table edits numbers in place, so exactly one cell can be "drafted"
 * at a time: tapping a cell starts a draft seeded with the current value,
 * typing updates the draft text, and committing parses it back into the
 * store. Keeping the draft as a string is what lets the field be cleared
 * mid-edit without the store ever holding a non-numeric weight.
 *
 * The keyboard is raised by making a hidden `TextInput` the focused
 * element; the hook owns that ref so the screen never wires focus by hand.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { Keyboard, type TextInput } from 'react-native';

import type { ActiveExercise, ActiveSet, FocusedCell, NumericField } from '../types';

/** Values returned by {@link useSetTableDraft}. */
export interface SetTableDraft {
  /** The cell being edited, or `null` when no cell is drafted. */
  focusedCell: FocusedCell | null;
  /** Current text of the drafted cell. */
  draftValue: string;
  /** Whether the numeric keyboard should be up. */
  isKeyboardOpen: boolean;
  /** Attach to the hidden `TextInput` that holds keyboard focus. */
  inputRef: React.RefObject<TextInput | null>;
  /** Start editing a cell, seeding the draft from its current value. */
  focusCell: (cell: FocusedCell, currentValue: number) => void;
  /** Replace the draft text. */
  changeDraft: (text: string) => void;
  /** Commit the draft if it parses, then clear it. */
  commit: () => void;
  /** Drop the draft without committing. */
  cancel: () => void;
  /** The value to render for a cell: draft text or the stored number. */
  displayValue: (cell: FocusedCell, actual: number) => string;
}

/** The write path a committed draft is sent to. */
export type CommitDraft = (
  cell: FocusedCell,
  value: number,
) => void;

/** Strip anything that is not a digit or a decimal point. */
export function sanitizeNumericInput(text: string): string {
  const cleaned = text.replace(/[^0-9.]/g, '');
  const [whole, ...rest] = cleaned.split('.');
  return rest.length === 0 ? whole : `${whole}.${rest.join('')}`;
}

/**
 * Parse draft text into a number, or `null` when it is not usable for
 * `field`. Weight accepts any non-negative number (0 = bodyweight); reps
 * must be a whole number of at least one.
 */
export function parseDraftValue(text: string, field: NumericField): number | null {
  if (text.trim() === '') return null;
  const value = Number(text);
  if (!Number.isFinite(value) || value < 0) return null;
  if (field === 'reps' && (!Number.isInteger(value) || value < 1)) return null;
  return value;
}

/** Whether two cell references point at the same field of the same set. */
export function sameCell(a: FocusedCell, b: FocusedCell): boolean {
  return a.setId === b.setId && a.field === b.field;
}

/**
 * One-cell draft state for the set table. `onCommit` receives the parsed
 * value; invalid text is simply dropped, leaving the stored value intact.
 *
 * The draft is mirrored into refs as well as state because it is committed
 * from event handlers that switch cells or hide the keyboard. Those handlers
 * must read the value the user last typed, not whatever an earlier render
 * closed over, or the typed number is lost when focus moves on.
 */
export function useSetTableDraft(onCommit: CommitDraft): SetTableDraft {
  const [focusedCell, setFocusedCell] = useState<FocusedCell | null>(null);
  const [draftValue, setDraftValue] = useState('');
  const inputRef = useRef<TextInput | null>(null);

  const cellRef = useRef<FocusedCell | null>(null);
  const textRef = useRef('');
  const commitRef = useRef(onCommit);
  commitRef.current = onCommit;

  /** Send a cell's draft to the write path, but only when it parses. */
  const writeDraft = useCallback((cell: FocusedCell, text: string): void => {
    const parsed = parseDraftValue(text, cell.field);
    if (parsed !== null) commitRef.current(cell, parsed);
  }, []);

  /** Drop the draft without touching keyboard focus. */
  const clearDraft = useCallback((): void => {
    cellRef.current = null;
    textRef.current = '';
    setFocusedCell(null);
    setDraftValue('');
  }, []);

  const commit = useCallback((): void => {
    const cell = cellRef.current;
    const text = textRef.current;
    clearDraft();
    if (cell !== null) writeDraft(cell, text);
  }, [clearDraft, writeDraft]);

  const cancel = useCallback((): void => {
    clearDraft();
    inputRef.current?.blur();
  }, [clearDraft]);

  /**
   * Start editing a cell. Moving from one cell to another commits the cell
   * being left behind first, because the hidden input keeps focus across a
   * tap and therefore never fires `onBlur` on its own.
   */
  const focusCell = useCallback(
    (cell: FocusedCell, currentValue: number): void => {
      const previous = cellRef.current;
      if (previous !== null && sameCell(previous, cell)) return;
      if (previous !== null) writeDraft(previous, textRef.current);

      const text = String(currentValue);
      cellRef.current = cell;
      textRef.current = text;
      setFocusedCell(cell);
      setDraftValue(text);
      inputRef.current?.focus();
    },
    [writeDraft],
  );

  const changeDraft = useCallback((text: string): void => {
    const sanitized = sanitizeNumericInput(text);
    textRef.current = sanitized;
    setDraftValue(sanitized);
  }, []);

  // Android's back gesture hides the keyboard without blurring the input.
  useEffect(() => {
    const subscription = Keyboard.addListener('keyboardDidHide', commit);
    return () => subscription.remove();
  }, [commit]);

  const displayValue = useCallback(
    (cell: FocusedCell, actual: number): string => {
      const isFocused = focusedCell !== null && sameCell(focusedCell, cell);
      return isFocused ? draftValue : String(actual);
    },
    [draftValue, focusedCell],
  );

  return {
    focusedCell,
    draftValue,
    isKeyboardOpen: focusedCell !== null,
    inputRef,
    focusCell,
    changeDraft,
    commit,
    cancel,
    displayValue,
  };
}

/** The first set of the block that has not been completed. */
export function findActiveSet(block: ActiveExercise | undefined): ActiveSet | null {
  if (block === undefined) return null;
  return block.sets.find((set) => !set.completed) ?? null;
}

/** Identifies a set by the exercise that owns it. */
export interface IncompleteSetRef {
  exerciseId: string;
  setId: string;
}

/**
 * The first incomplete set in reading order across the whole table, or
 * `null` when every set has been completed. This is the target of the
 * "Log set" action when no cell is focused.
 */
export function firstIncompleteSet(
  exercises: ActiveExercise[],
): IncompleteSetRef | null {
  for (const block of exercises) {
    const set = block.sets.find((candidate) => !candidate.completed);
    if (set !== undefined) {
      return { exerciseId: block.exerciseId, setId: set.id };
    }
  }
  return null;
}

/** Every numeric cell of the table, in reading order. */
export function listCells(exercises: ActiveExercise[]): FocusedCell[] {
  const cells: FocusedCell[] = [];
  for (const block of exercises) {
    for (const set of block.sets) {
      cells.push({ setId: set.id, field: 'weight' });
      cells.push({ setId: set.id, field: 'reps' });
    }
  }
  return cells;
}

/**
 * The next numeric cell after `cell` in reading order — weight then reps
 * of the following set, continuing into the next exercise block. Returns
 * `null` at the end of the table.
 */
export function nextCell(
  exercises: ActiveExercise[],
  cell: FocusedCell,
): FocusedCell | null {
  const cells = listCells(exercises);
  const index = cells.findIndex(
    (candidate) =>
      candidate.setId === cell.setId && candidate.field === cell.field,
  );
  if (index < 0) return null;
  return cells[index + 1] ?? null;
}
