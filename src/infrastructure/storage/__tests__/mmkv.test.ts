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

import { createMMKVJSONStorage, storage, zustandStorage } from '../mmkv';

beforeEach(() => {
  mockMemory.clear();
});

describe('storage', () => {
  it('creates the shared kinetic MMKV instance', () => {
    expect(storage).toBeDefined();
  });
});

describe('zustandStorage', () => {
  it('getItem returns null for a missing key', () => {
    expect(zustandStorage.getItem('missing')).toBeNull();
  });

  it('setItem then getItem round-trips a value', () => {
    zustandStorage.setItem('key', 'value');
    expect(zustandStorage.getItem('key')).toBe('value');
  });

  it('removeItem clears a key', () => {
    zustandStorage.setItem('key', 'value');
    zustandStorage.removeItem('key');
    expect(zustandStorage.getItem('key')).toBeNull();
  });
});

describe('createMMKVJSONStorage', () => {
  it('round-trips objects through JSON', () => {
    const jsonStorage = createMMKVJSONStorage<{ count: number }>();
    expect(jsonStorage).toBeDefined();

    jsonStorage?.setItem('store', { state: { count: 3 }, version: 1 });
    expect(jsonStorage?.getItem('store')).toEqual({ state: { count: 3 }, version: 1 });
  });
});
