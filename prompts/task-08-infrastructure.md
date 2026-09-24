TASK 08 — INFRASTRUCTURE LAYER

Build the infrastructure layer: MMKV persistence, secure storage, network client, and offline queue. This layer sits below features and provides platform adapters.

Read first:

- /AGENTS.md
- /src/domain/index.ts (or each entity index)
- /src/services/firebase/config.ts (existing — do NOT modify)

Do NOT read \_legacy, features, or components.

==================================================
FILES TO CREATE
==================================================

src/infrastructure/storage/mmkv.ts
src/infrastructure/storage/secureStorage.ts
src/infrastructure/storage/index.ts
src/infrastructure/storage/**tests**/mmkv.test.ts

src/infrastructure/network/apiClient.ts
src/infrastructure/network/offlineQueue.ts
src/infrastructure/network/index.ts
src/infrastructure/network/**tests**/offlineQueue.test.ts

src/infrastructure/index.ts

Total: 9 files.

==================================================
STORAGE — mmkv.ts
==================================================

Create a shared MMKV instance and a StateStorage adapter compatible with zustand/middleware/persist.

Imports needed:
import { MMKV } from 'react-native-mmkv';
import type { StateStorage } from 'zustand/middleware';

Exports:
export const storage = new MMKV({ id: 'kinetic' });
export const zustandStorage: StateStorage

zustandStorage implements three methods:
getItem(name): returns storage.getString(name) ?? null
setItem(name, value): calls storage.set(name, value)
removeItem(name): calls storage.delete(name)

Also export a helper createMMKVJSONStorage() that wraps zustandStorage with createJSONStorage from zustand/middleware.

==================================================
STORAGE — secureStorage.ts
==================================================

Firebase auth token storage only. Uses expo-secure-store.

Exports (all async):
saveAuthToken(token: string): Promise<void>
getAuthToken(): Promise<string | null>
clearAuthToken(): Promise<void>

Key constant: 'auth:token'.

Handle errors silently. getAuthToken returns null on read failure, never throws.

==================================================
NETWORK — apiClient.ts
==================================================

A thin fetch wrapper. The backend is Firebase, but this module provides a small utility surface for Cloud Functions, Google APIs, and future REST endpoints.

Types:
export interface ApiError {
message: string;
status: number;
code?: string;
}

export interface RequestOptions {
method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
body?: unknown;
headers?: Record<string, string>;
timeoutMs?: number;
requiresAuth?: boolean;
}

Functions:
export async function apiRequest<T>(path: string, options?: RequestOptions): Promise<T>;
export function isApiError(err: unknown): err is ApiError;

Behavior:

- Base URL from process.env.EXPO_PUBLIC_API_URL. If missing, throw on first call. Never silently default.
- Default timeout: 15000ms via AbortController.
- When requiresAuth is true, read token via getAuthToken() and add Authorization: Bearer <token>.
- On non-2xx, throw ApiError with status, message from response body if possible, and code from response if present.
- On network failure, throw ApiError with status 0 and a clear message.
- On timeout, throw ApiError with status 0 and message 'Request timed out'.
- Response parsed as JSON. If parse fails, throw ApiError with status from response and a clear message.

Do not use axios. Use global fetch.

==================================================
NETWORK — offlineQueue.ts
==================================================

A queue for mutations that must survive offline periods. Zustand-persisted to MMKV.

Types:
export interface QueuedMutation {
id: string;
endpoint: string;
method: 'POST' | 'PUT' | 'DELETE';
body: unknown;
createdAt: number;
attempts: number;
lastError?: string;
}

State interface:
queue: QueuedMutation[]
enqueue(m: Omit<QueuedMutation, 'id' | 'createdAt' | 'attempts'>): void
remove(id: string): void
flush(): Promise<void>
clear(): void

Exports:
export const useOfflineQueue — Zustand store, persisted with zustandStorage
export function startOfflineQueueListener(): () => void

startOfflineQueueListener:

- Subscribes to @react-native-community/netinfo.
- When isConnected === true, calls useOfflineQueue.getState().flush().
- Returns an unsubscribe function.
- Do not subscribe multiple times — guard against duplicate listeners.

flush() behavior:

- Process the queue in FIFO order.
- For each item, call apiRequest with the stored endpoint, method, and body.
- On success: remove the item from the queue, continue to next.
- On failure: increment attempts, store lastError, and STOP processing.
  Do NOT skip ahead — ordering matters for mutations.
- If an item reaches 5 attempts, drop it (remove from queue) and
  continue with the next item.
- Never throw from flush. Catch everything internally.

Use nanoid for id generation.

==================================================
TESTS
==================================================

src/infrastructure/storage/**tests**/mmkv.test.ts
Mock react-native-mmkv with an in-memory Map. Tests:

- zustandStorage.getItem returns null for a missing key
- setItem then getItem round-trips a value
- removeItem clears a key

src/infrastructure/network/**tests**/offlineQueue.test.ts
Mock apiRequest and NetInfo. Tests:

- enqueue adds an item with a generated id and zero attempts
- remove clears the specified item
- flush processes items in FIFO order
- flush stops on the first failure and retains the remaining queue
- after 5 failed attempts, an item is dropped and flush continues
- clear empties the queue

==================================================
CONSTRAINTS
==================================================

- Pure infrastructure. No React components. No navigation.
- No imports from features/ or components/.
- Path aliases: @infrastructure, @domain, @lib.
- Zustand selectors from useOfflineQueue must use useShallow.
- No `any`. Use `unknown` + type guards.
- JSDoc on every exported function.
- Do not modify /src/services/firebase/ — it works and stays.
- Do not add new dependencies.

==================================================
DELIVERABLES
==================================================

Report ONLY:

- Files created: N
- tsc: <clean | error count>
- jest src/infrastructure: <X passed, Y failed>
- Judgment calls: max 3 bullet points

Run all commands yourself in the current environment. Paste the trimmed output. Do not report results you did not observe.

Then stop.
