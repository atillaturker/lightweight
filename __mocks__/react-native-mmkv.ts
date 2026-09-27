/**
 * Jest stand-in for react-native-mmkv's native module: an in-memory store.
 * Used by any test that does not declare its own `jest.mock`.
 */
export function createMMKV() {
  const memory = new Map<string, string>();
  return {
    getString: (key: string) => memory.get(key),
    set: (key: string, value: string) => {
      memory.set(key, value);
    },
    remove: (key: string) => {
      memory.delete(key);
    },
  };
}
