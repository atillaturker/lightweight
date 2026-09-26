/**
 * Tests for the persisted preferences store.
 *
 * These pin the defaults the Profile screen renders on a fresh install,
 * each setter, and the persisted payload shape (data fields only, under
 * the `preferences` key).
 */

// In-memory MMKV double, matching the pattern used across the suite.
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

import {
  DEFAULT_PREFERENCES,
  usePreferencesStore,
} from '../preferencesStore';

/** Read and parse the persisted `preferences` payload, or `null`. */
function persisted(): { state: Record<string, unknown> } | null {
  const raw = mockMemory.get('preferences');
  if (!raw) return null;
  return JSON.parse(raw) as { state: Record<string, unknown> };
}

beforeEach(() => {
  mockMemory.clear();
  usePreferencesStore.setState({ ...DEFAULT_PREFERENCES });
});

describe('preferences store defaults', () => {
  it('matches the documented values', () => {
    const state = usePreferencesStore.getState();

    expect(state.unit).toBe('kg');
    expect(state.weekStart).toBe('monday');
    expect(state.rpeEnabled).toBe(false);
    expect(state.restTimerSeconds).toBe(90);
    expect(state.notificationsEnabled).toBe(true);
  });
});

describe('preferences store setters', () => {
  it('setUnit updates and persists the unit', () => {
    usePreferencesStore.getState().setUnit('lb');

    expect(usePreferencesStore.getState().unit).toBe('lb');
    expect(persisted()?.state.unit).toBe('lb');
  });

  it('setWeekStart updates and persists the week start', () => {
    usePreferencesStore.getState().setWeekStart('sunday');

    expect(usePreferencesStore.getState().weekStart).toBe('sunday');
    expect(persisted()?.state.weekStart).toBe('sunday');
  });

  it('setRpeEnabled updates and persists the toggle', () => {
    usePreferencesStore.getState().setRpeEnabled(true);

    expect(usePreferencesStore.getState().rpeEnabled).toBe(true);
    expect(persisted()?.state.rpeEnabled).toBe(true);
  });

  it('setRestTimerSeconds updates and persists the duration', () => {
    usePreferencesStore.getState().setRestTimerSeconds(120);

    expect(usePreferencesStore.getState().restTimerSeconds).toBe(120);
    expect(persisted()?.state.restTimerSeconds).toBe(120);
  });

  it('setNotificationsEnabled updates and persists the toggle', () => {
    usePreferencesStore.getState().setNotificationsEnabled(false);

    expect(usePreferencesStore.getState().notificationsEnabled).toBe(false);
    expect(persisted()?.state.notificationsEnabled).toBe(false);
  });
});

describe('preferences persist shape', () => {
  it('writes exactly the preference fields', () => {
    usePreferencesStore.getState().setUnit('lb');

    expect(Object.keys(persisted()?.state ?? {}).sort()).toEqual([
      'notificationsEnabled',
      'restTimerSeconds',
      'rpeEnabled',
      'unit',
      'weekStart',
    ]);
  });
});
