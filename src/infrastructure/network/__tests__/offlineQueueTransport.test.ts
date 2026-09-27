/**
 * Tests for queued-mutation delivery: every mutation goes to the handler
 * the app layer registers, and nothing is lost while none is registered.
 */
const mockFirestoreHandler = jest.fn();

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
    expect(useOfflineQueue.getState().queue).toHaveLength(0);
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
