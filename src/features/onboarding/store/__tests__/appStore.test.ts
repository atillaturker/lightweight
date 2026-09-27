/**
 * Tests for the app store: the two first-run flags and their persist
 * boundary. Both flags describe the install, so both must survive a
 * sign-out — these tests pin that contract.
 */

// In-memory MMKV double. Populated by the store's persist middleware, so
// tests can assert exactly what was written to disk.
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

import { useAppStore } from '../appStore';

/** Read and parse the persisted `app` payload, or `null` when absent. */
function readPersistedApp(): { state: Record<string, unknown> } | null {
  const raw = mockMemory.get('app');
  if (!raw) return null;
  return JSON.parse(raw) as { state: Record<string, unknown> };
}

beforeEach(() => {
  mockMemory.clear();
  useAppStore.setState({ hasSeenWelcome: false, hasSeenIntro: false });
});

describe('initial state', () => {
  it('starts with both first-run flags unset', () => {
    expect(useAppStore.getState().hasSeenWelcome).toBe(false);
    expect(useAppStore.getState().hasSeenIntro).toBe(false);
  });
});

describe('markWelcomeSeen', () => {
  it('sets the welcome flag', () => {
    useAppStore.getState().markWelcomeSeen();

    expect(useAppStore.getState().hasSeenWelcome).toBe(true);
  });

  it('leaves the intro flag untouched', () => {
    useAppStore.getState().markWelcomeSeen();

    expect(useAppStore.getState().hasSeenIntro).toBe(false);
  });

  it('writes the flag to persistence', () => {
    useAppStore.getState().markWelcomeSeen();

    expect(readPersistedApp()?.state.hasSeenWelcome).toBe(true);
  });
});

describe('markIntroSeen', () => {
  it('sets the intro flag', () => {
    useAppStore.getState().markIntroSeen();

    expect(useAppStore.getState().hasSeenIntro).toBe(true);
  });

  it('writes the flag to persistence', () => {
    useAppStore.getState().markIntroSeen();

    expect(readPersistedApp()?.state.hasSeenIntro).toBe(true);
  });
});

describe('persist', () => {
  it('restores both flags from storage, so they survive a sign-out', async () => {
    // Simulate a cold start: reset in-memory state first (which itself
    // writes to storage), then plant what a previous session left behind.
    useAppStore.setState({ hasSeenWelcome: false, hasSeenIntro: false });
    mockMemory.set(
      'app',
      JSON.stringify({
        state: { hasSeenWelcome: true, hasSeenIntro: true },
        version: 0,
      }),
    );

    await useAppStore.persist.rehydrate();

    expect(useAppStore.getState().hasSeenWelcome).toBe(true);
    expect(useAppStore.getState().hasSeenIntro).toBe(true);
  });

  it('persists only the two flags, never the mutators', () => {
    useAppStore.getState().markWelcomeSeen();
    useAppStore.getState().markIntroSeen();

    expect(Object.keys(readPersistedApp()?.state ?? {}).sort()).toEqual([
      'hasSeenIntro',
      'hasSeenWelcome',
    ]);
  });
});
