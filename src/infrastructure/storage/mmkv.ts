import { createJSONStorage, type PersistStorage, type StateStorage } from 'zustand/middleware';
import { createMMKV, type MMKV } from 'react-native-mmkv';

/** Shared MMKV instance used by all persisted client state in the app. */
export const storage: MMKV = createMMKV({ id: 'kinetic' });

/**
 * `StateStorage` adapter so zustand's persist middleware can write to MMKV.
 *
 * Values are stored as plain strings; wrap this with
 * {@link createMMKVJSONStorage} when persisting objects.
 */
export const zustandStorage: StateStorage = {
  getItem: (name) => storage.getString(name) ?? null,
  setItem: (name, value) => {
    storage.set(name, value);
  },
  removeItem: (name) => {
    storage.remove(name);
  },
};

/**
 * Build a JSON `PersistStorage` backed by MMKV.
 *
 * Use as the `storage` option of zustand's persist middleware:
 * `persist(initializer, { name: 'x', storage: createMMKVJSONStorage() })`.
 */
export function createMMKVJSONStorage<S>(): PersistStorage<S, unknown> | undefined {
  return createJSONStorage<S>(() => zustandStorage);
}
