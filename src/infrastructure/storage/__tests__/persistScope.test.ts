const mockMemory = new Map<string, string>();

jest.mock('react-native-mmkv', () => ({
  createMMKV: () => ({
    getString: (key: string) => mockMemory.get(key),
    set: (key: string, value: string) => {
      mockMemory.set(key, value);
    },
    remove: (key: string) => {
      mockMemory.delete(key);
    },
  }),
}));

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { zustandStorage } from '../mmkv';
import { switchPersistScope, toScopedKey } from '../persistScope';

interface NotesState {
  notes: string[];
  draft: string;
  addNote: (note: string) => void;
}

/** A persisted store with one persisted and one transient field. */
function createNotesStore() {
  return create<NotesState>()(
    persist(
      (set) => ({
        notes: [],
        draft: '',
        addNote: (note) => set((state) => ({ notes: [...state.notes, note] })),
      }),
      {
        name: 'notes',
        storage: createJSONStorage(() => zustandStorage),
        partialize: (state) => ({ notes: state.notes }),
      },
    ),
  );
}

beforeEach(() => {
  mockMemory.clear();
});

describe('toScopedKey', () => {
  it('appends the scope to the base key', () => {
    expect(toScopedKey('history', 'uid-1')).toBe('history:uid-1');
  });
});

describe('switchPersistScope', () => {
  it('keeps each scope isolated and restores it on return', () => {
    const store = createNotesStore();

    switchPersistScope(store, 'notes', 'uid-a', true);
    store.getState().addNote('a1');
    switchPersistScope(store, 'notes', 'uid-b', true);

    expect(store.getState().notes).toEqual([]);

    store.getState().addNote('b1');
    switchPersistScope(store, 'notes', 'uid-a', true);

    expect(store.getState().notes).toEqual(['a1']);
  });

  it('does not overwrite the scope being left', () => {
    const store = createNotesStore();

    switchPersistScope(store, 'notes', 'uid-a', true);
    store.getState().addNote('a1');
    switchPersistScope(store, 'notes', 'signed-out', false);

    expect(mockMemory.get('notes:uid-a')).toContain('a1');
  });

  it('resets transient fields when switching', () => {
    const store = createNotesStore();

    switchPersistScope(store, 'notes', 'uid-a', true);
    store.setState({ draft: 'typing' });
    switchPersistScope(store, 'notes', 'uid-b', true);

    expect(store.getState().draft).toBe('');
  });

  it('adopts unscoped data into the first adopting scope only', () => {
    const store = createNotesStore();
    store.getState().addNote('legacy');

    switchPersistScope(store, 'notes', 'uid-a', true);
    expect(store.getState().notes).toEqual(['legacy']);
    expect(mockMemory.has('notes')).toBe(false);

    switchPersistScope(store, 'notes', 'uid-b', true);
    expect(store.getState().notes).toEqual([]);
  });

  it('leaves unscoped data alone when the scope does not adopt', () => {
    const store = createNotesStore();
    store.getState().addNote('legacy');

    switchPersistScope(store, 'notes', 'signed-out', false);

    expect(store.getState().notes).toEqual([]);
    expect(mockMemory.has('notes')).toBe(true);
  });
});
