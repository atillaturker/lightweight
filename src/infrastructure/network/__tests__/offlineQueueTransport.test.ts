/**
 * Tests for the queued-mutation transport switch.
 *
 * HTTP stays the default so existing callers are unaffected. Firestore
 * mutations are dispatched to the handler registered by the app layer, and
 * the queue never delivers a Firestore mutation through `apiRequest`.
 */
const mockApiRequest = jest.fn();
const mockFirestoreHandler = jest.fn();

jest.mock('../../network/apiClient', () => {
  const actual = jest.requireActual('../../network/apiClient');
  return {
    ...actual,
    apiRequest: (...args: unknown[]) => mockApiRequest(...args),
  };
});

jest.mock('@lib/id', () => ({
  createId: () => 'id-1',
}));

jest.mock('@infrastructure/storage/mmkv', () => ({
  createMMKVJSONStorage: () => ({
    getItem: () => null,
    setItem: () => undefined,
    removeItem: () => undefined,
  }),
}));

import {
  setFirestoreQueueTransport,
  useOfflineQueue,
} from '../offlineQueue';

beforeEach(() => {
  jest.clearAllMocks();
  mockApiRequest.mockResolvedValue(undefined);
  mockFirestoreHandler.mockResolvedValue(undefined);
  useOfflineQueue.setState({ queue: [] });
  setFirestoreQueueTransport(null);
});

afterEach(() => {
  setFirestoreQueueTransport(null);
});

describe('useOfflineQueue.flush transport dispatch', () => {
  it('routes Firestore mutations to the registered handler', async () => {
    setFirestoreQueueTransport(mockFirestoreHandler);
    useOfflineQueue.getState().enqueue({
      endpoint: 'firestore/users/uid/workouts/w1',
      method: 'PUT',
      transport: 'firestore',
      body: { kind: 'saveWorkout' },
    });

    await useOfflineQueue.getState().flush();

    expect(mockFirestoreHandler).toHaveBeenCalledTimes(1);
    expect(mockApiRequest).not.toHaveBeenCalled();
    expect(useOfflineQueue.getState().queue).toHaveLength(0);
  });

  it('keeps HTTP as the default transport', async () => {
    useOfflineQueue.getState().enqueue({
      endpoint: '/workouts',
      method: 'POST',
      body: null,
    });

    await useOfflineQueue.getState().flush();

    expect(mockApiRequest).toHaveBeenCalledTimes(1);
    expect(mockFirestoreHandler).not.toHaveBeenCalled();
  });

  it('retains a Firestore mutation when no handler is registered', async () => {
    useOfflineQueue.getState().enqueue({
      endpoint: 'firestore/users/uid/workouts/w1',
      method: 'PUT',
      transport: 'firestore',
      body: { kind: 'saveWorkout' },
    });

    await useOfflineQueue.getState().flush();

    const queue = useOfflineQueue.getState().queue;
    expect(queue).toHaveLength(1);
    expect(queue[0].attempts).toBe(1);
  });
});
