/**
 * Per-scope persistence for zustand stores.
 *
 * A persisted store normally writes to one fixed MMKV key, so every account
 * that signs in on the device shares the same data. Scoping moves the store
 * to `<baseKey>:<scope>` (the scope is usually a uid) and reloads its state
 * from that key, so each account keeps its own copy and a switch never
 * destroys the data of the account being left.
 */
import { storage } from './mmkv';

/**
 * The slice of a persisted zustand store that scoping needs. Structural, so
 * any `create()(persist(...))` store satisfies it without importing
 * zustand's middleware types here.
 */
export interface ScopablePersistStore<S> {
  getInitialState: () => S;
  persist: {
    setOptions: (options: {
      name: string;
      merge: (persistedState: unknown, currentState: S) => S;
    }) => void;
    rehydrate: () => Promise<void> | void;
  };
}

/** The MMKV key a store uses for `scope`. */
export function toScopedKey(baseKey: string, scope: string): string {
  return `${baseKey}:${scope}`;
}

/**
 * Move data written before scoping existed (under the bare `baseKey`) into
 * `scopedKey`, unless that scope already has data of its own. The bare key
 * is removed afterwards so it can be adopted only once.
 */
function adoptUnscopedValue(baseKey: string, scopedKey: string): void {
  const legacy = storage.getString(baseKey);
  if (legacy === undefined) return;
  if (storage.getString(scopedKey) === undefined) {
    storage.set(scopedKey, legacy);
  }
  storage.remove(baseKey);
}

/**
 * Point `store` at `scope` and load that scope's state.
 *
 * The state is rebuilt from the store's initial state plus whatever the
 * scope has persisted, so nothing — persisted or transient — carries over
 * from the previous scope. A scope with no data yet starts from the initial
 * state. Nothing is written during the switch, so the scope being left
 * keeps its data intact. With MMKV's synchronous storage the new state is
 * in place before this returns.
 *
 * Pass `adoptUnscoped` for the scope that should inherit data persisted
 * before scoping was introduced (the signed-in account).
 */
export function switchPersistScope<S>(
  store: ScopablePersistStore<S>,
  baseKey: string,
  scope: string,
  adoptUnscoped: boolean,
): void {
  const scopedKey = toScopedKey(baseKey, scope);
  if (adoptUnscoped) adoptUnscopedValue(baseKey, scopedKey);
  store.persist.setOptions({
    name: scopedKey,
    merge: (persistedState) => ({
      ...store.getInitialState(),
      ...(typeof persistedState === 'object' && persistedState !== null
        ? persistedState
        : {}),
    }),
  });
  void store.persist.rehydrate();
}
