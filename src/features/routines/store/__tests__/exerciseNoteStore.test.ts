jest.mock('react-native-mmkv', () => ({
  createMMKV: () => ({ getString: () => undefined, set: () => undefined, remove: () => undefined }),
}));

import { EXERCISE_NOTE_MAX_LENGTH, useExerciseNoteStore } from '../exerciseNoteStore';

beforeEach(() => {
  useExerciseNoteStore.setState({ notes: {} });
});

describe('setNote', () => {
  it('stores a trimmed note with its time', () => {
    useExerciseNoteStore.getState().setNote('bench-press', '  Seat 4 \n', 10);
    expect(useExerciseNoteStore.getState().notes).toEqual({ 'bench-press': { text: 'Seat 4', updatedAt: 10 } });
  });

  it('removes the note when the text is blank', () => {
    useExerciseNoteStore.getState().setNote('bench-press', 'Seat 4');
    useExerciseNoteStore.getState().setNote('bench-press', '   ');
    expect(useExerciseNoteStore.getState().notes).toEqual({});
  });

  it('caps the note length', () => {
    useExerciseNoteStore.getState().setNote('squat', 'x'.repeat(EXERCISE_NOTE_MAX_LENGTH + 20));
    expect(useExerciseNoteStore.getState().notes.squat?.text).toHaveLength(EXERCISE_NOTE_MAX_LENGTH);
  });
});
