import NetInfo from '@react-native-community/netinfo';
import { nanoid } from 'nanoid';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { createMMKVJSONStorage } from '@infrastructure/storage/mmkv';

import { apiRequest, isApiError } from './apiClient';

/** A single queued mutation awaiting delivery to the backend. */
export interface QueuedMutation {
  id: string;
  endpoint: string;
  method: 'POST' | 'PUT' | 'DELETE';
  body: unknown;
  createdAt: number;
  attempts: number;
  lastError?: string;
}

/** Payload accepted by {@link OfflineQueueState.enqueue}. */
export type NewQueuedMutation = Omit<QueuedMutation, 'id' | 'createdAt' | 'attempts'>;

/** Client state for the offline mutation queue. */
export interface OfflineQueueState {
  queue: QueuedMutation[];
  enqueue: (m: NewQueuedMutation) => void;
  remove: (id: string) => void;
  flush: () => Promise<void>;
  clear: () => void;
}

/** Attempts before an undeliverable mutation is dropped from the queue. */
const MAX_ATTEMPTS = 5;

let listenerActive = false;
let unsubscribeListener: (() => void) | null = null;

/** Normalize an unknown failure into a display string for `lastError`. */
function toErrorMessage(err: unknown): string {
  if (isApiError(err)) return err.message;
  if (err instanceof Error) return err.message;
  return 'Unknown error';
}

/**
 * Global offline mutation queue, persisted to MMKV.
 *
 * FIFO ordering is preserved during {@link OfflineQueueState.flush} so
 * mutations always reach the backend in the order the user created them.
 */
export const useOfflineQueue = create<OfflineQueueState>()(
  persist(
    (set, get) => ({
      queue: [],

      enqueue: (m) =>
        set((state) => ({
          queue: [
            ...state.queue,
            { ...m, id: nanoid(), createdAt: Date.now(), attempts: 0 },
          ],
        })),

      remove: (id) =>
        set((state) => ({ queue: state.queue.filter((item) => item.id !== id) })),

      clear: () => set({ queue: [] }),

      flush: async () => {
        // Snapshot: mutations added mid-flush are handled on the next pass.
        const pending = [...get().queue];

        for (const item of pending) {
          try {
            await apiRequest(item.endpoint, {
              method: item.method,
              body: item.body,
              requiresAuth: true,
            });
            get().remove(item.id);
          } catch (err) {
            const attempts = item.attempts + 1;
            if (attempts >= MAX_ATTEMPTS) {
              get().remove(item.id);
              continue;
            }
            set((state) => ({
              queue: state.queue.map((entry) =>
                entry.id === item.id
                  ? { ...entry, attempts, lastError: toErrorMessage(err) }
                  : entry,
              ),
            }));
            // Ordering matters: stop rather than skipping ahead.
            return;
          }
        }
      },
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
