import NetInfo from '@react-native-community/netinfo';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { createMMKVJSONStorage } from '@infrastructure/storage/mmkv';
import { createId } from '@lib/id';

/** How a queued mutation is delivered once connectivity returns. */
export type QueueTransport = 'firestore';

/** A single queued mutation awaiting delivery to the backend. */
export interface QueuedMutation {
  id: string;
  endpoint: string;
  method: 'POST' | 'PUT' | 'DELETE';
  body: unknown;
  createdAt: number;
  attempts: number;
  lastError?: string;
  /** Delivery mechanism. Every mutation goes through the registered handler. */
  transport?: QueueTransport;
  /**
   * Owner of the mutation (usually a uid). A scoped mutation is delivered
   * only while the registered scope provider reports the same scope; an
   * unscoped one is always deliverable.
   */
  scope?: string;
  /**
   * Set once {@link MAX_ATTEMPTS} deliveries have failed. A failed mutation
   * is kept, never dropped, but skipped by `flush` until `retryFailed`.
   */
  failed?: boolean;
}

/** Payload accepted by {@link OfflineQueueState.enqueue}. */
export type NewQueuedMutation = Omit<
  QueuedMutation,
  'id' | 'createdAt' | 'attempts' | 'lastError' | 'failed'
>;

/** Delivers one queued mutation. Rejects to trigger a retry. */
export type QueueTransportHandler = (mutation: QueuedMutation) => Promise<void>;

/** Client state for the offline mutation queue. */
export interface OfflineQueueState {
  queue: QueuedMutation[];
  enqueue: (m: NewQueuedMutation) => void;
  remove: (id: string) => void;
  flush: () => Promise<void>;
  /** Give every failed mutation a fresh set of attempts. */
  retryFailed: () => void;
  clear: () => void;
}

/** Failed deliveries before a mutation is parked as `failed`. */
export const MAX_ATTEMPTS = 5;

/** Supplies the scope whose mutations may be delivered now. */
export type QueueScopeProvider = () => string | null;

let scopeProvider: QueueScopeProvider | null = null;

/** The flush currently running, shared by concurrent callers. */
let inFlight: Promise<void> | null = null;
/** Whether a flush was requested while another was running. */
let rerunRequested = false;

let listenerActive = false;
let unsubscribeListener: (() => void) | null = null;

/**
 * Handler for `'firestore'` mutations, registered by the app layer (which
 * is the only place that may know about Firestore). Unset by default so
 * this module carries no Firebase dependency.
 */
let firestoreTransport: QueueTransportHandler | null = null;

/**
 * Register (or clear) the source of the current scope. With no provider,
 * scoped mutations are never delivered, so they cannot reach the wrong
 * account before the app layer has said who is signed in.
 */
export function setQueueScopeProvider(provider: QueueScopeProvider | null): void {
  scopeProvider = provider;
}

/** Register (or clear) the Firestore delivery handler. */
export function setFirestoreQueueTransport(
  handler: QueueTransportHandler | null,
): void {
  firestoreTransport = handler;
}

/** The registered delivery handler, or throw when none is set. */
function resolveTransport(): QueueTransportHandler {
  if (firestoreTransport === null) {
    throw new Error('Firestore queue transport is not configured');
  }
  return firestoreTransport;
}

/** Normalize an unknown failure into a display string for `lastError`. */
function toErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return 'Unknown error';
}

/** Whether `item` belongs to the scope that may be delivered now. */
function isInScope(item: QueuedMutation): boolean {
  if (item.scope === undefined) return true;
  return scopeProvider !== null && scopeProvider() === item.scope;
}

type QueueSet = (partial: (state: OfflineQueueState) => Partial<OfflineQueueState>) => void;

/** Record a failed delivery; returns whether the item is now parked. */
function recordFailure(set: QueueSet, item: QueuedMutation, err: unknown): boolean {
  const attempts = item.attempts + 1;
  const failed = attempts >= MAX_ATTEMPTS;
  set((state) => ({
    queue: state.queue.map((entry) =>
      entry.id === item.id
        ? { ...entry, attempts, failed, lastError: toErrorMessage(err) }
        : entry,
    ),
  }));
  return failed;
}

/**
 * One pass over a snapshot of the queue. Mutations added mid-pass are
 * handled by the next pass.
 *
 * Ordering: a transient failure stops the pass so nothing overtakes it. A
 * parked (`failed`) mutation no longer blocks the queue, but later
 * mutations for the same endpoint are held behind it so a document never
 * sees its operations out of order. Out-of-scope mutations are skipped
 * without spending an attempt.
 */
async function deliverPass(get: () => OfflineQueueState, set: QueueSet): Promise<void> {
  const held = new Set<string>();
  for (const item of [...get().queue]) {
    if (!isInScope(item)) continue;
    if (item.failed === true || held.has(item.endpoint)) {
      held.add(item.endpoint);
      continue;
    }
    try {
      await resolveTransport()(item);
      get().remove(item.id);
    } catch (err) {
      if (!recordFailure(set, item, err)) return;
      held.add(item.endpoint);
    }
  }
}

/**
 * Run passes until no further flush was requested. Concurrent callers
 * share the running flush instead of delivering the same items twice.
 */
function runFlush(get: () => OfflineQueueState, set: QueueSet): Promise<void> {
  if (inFlight !== null) {
    rerunRequested = true;
    return inFlight;
  }
  inFlight = (async () => {
    do {
      rerunRequested = false;
      await deliverPass(get, set);
    } while (rerunRequested);
  })().finally(() => {
    inFlight = null;
  });
  return inFlight;
}

/**
 * Global offline mutation queue, persisted to MMKV.
 *
 * Mutations are delivered in the order they were created. Nothing is ever
 * dropped for failing: see {@link deliverPass} for how failures are parked.
 */
export const useOfflineQueue = create<OfflineQueueState>()(
  persist(
    (set, get) => ({
      queue: [],

      enqueue: (m) =>
        set((state) => ({
          queue: [
            ...state.queue,
            { ...m, id: createId(), createdAt: Date.now(), attempts: 0 },
          ],
        })),

      remove: (id) =>
        set((state) => ({ queue: state.queue.filter((item) => item.id !== id) })),

      clear: () => set({ queue: [] }),

      flush: () => runFlush(get, set),

      retryFailed: () =>
        set((state) => ({
          queue: state.queue.map((entry) =>
            entry.failed === true ? { ...entry, failed: false, attempts: 0 } : entry,
          ),
        })),
    }),
    {
      name: 'offline-queue',
      storage: createMMKVJSONStorage<{ queue: QueuedMutation[] }>(),
      partialize: (state) => ({ queue: state.queue }),
    },
  ),
);

/**
 * Subscribe the offline queue to network connectivity.
 *
 * Flushes the queue whenever connectivity is restored. Calling it more than
 * once is a no-op while a listener is already active; the returned function
 * unsubscribes (and resets the guard so it can be started again).
 */
export function startOfflineQueueListener(): () => void {
  if (listenerActive && unsubscribeListener) {
    return unsubscribeListener;
  }

  listenerActive = true;
  const unsub = NetInfo.addEventListener((state) => {
    if (state.isConnected === true) {
      void useOfflineQueue.getState().flush();
    }
  });

  unsubscribeListener = () => {
    unsub();
    listenerActive = false;
    unsubscribeListener = null;
  };

  return unsubscribeListener;
}
