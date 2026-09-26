const mockApiRequest = jest.fn();

jest.mock('../../network/apiClient', () => {
  const actual = jest.requireActual('../../network/apiClient');
  return {
    ...actual,
    apiRequest: (...args: unknown[]) => mockApiRequest(...args),
  };
});

jest.mock('@lib/id', () => ({
  createId: () => `id-${Math.random().toString(36).slice(2)}`,
}));

type NetInfoListener = (state: { isConnected: boolean | null }) => void;

const mockUnsubscribe = jest.fn();
const mockAddEventListener = jest.fn((_listener: NetInfoListener): (() => void) => mockUnsubscribe);

jest.mock('@react-native-community/netinfo', () => ({
  __esModule: true,
  default: {
    addEventListener: (listener: NetInfoListener) => mockAddEventListener(listener),
  },
}));

jest.mock('@infrastructure/storage/mmkv', () => {
  const memory = new Map<string, string>();
  return {
    createMMKVJSONStorage: () => ({
      getItem: (name: string) => {
        const raw = memory.get(name);
        return raw ? JSON.parse(raw) : null;
      },
      setItem: (name: string, value: unknown) => {
        memory.set(name, JSON.stringify(value));
      },
      removeItem: (name: string) => {
        memory.delete(name);
      },
    }),
  };
});

import { startOfflineQueueListener, useOfflineQueue } from '../offlineQueue';

/** Reset the persisted store between tests. */
function resetQueue(): void {
  useOfflineQueue.setState({ queue: [] });
}

const flush = () => useOfflineQueue.getState().flush();

beforeEach(() => {
  jest.clearAllMocks();
  mockApiRequest.mockResolvedValue(undefined);
  resetQueue();
});

describe('useOfflineQueue.enqueue', () => {
  it('adds an item with a generated id and zero attempts', () => {
    useOfflineQueue.getState().enqueue({
      endpoint: '/sessions',
      method: 'POST',
      body: { a: 1 },
    });

    const [item] = useOfflineQueue.getState().queue;
    expect(item.id).toEqual(expect.any(String));
    expect(item.id.length).toBeGreaterThan(0);
    expect(item.attempts).toBe(0);
    expect(item.createdAt).toEqual(expect.any(Number));
    expect(item).toMatchObject({
      endpoint: '/sessions',
      method: 'POST',
      body: { a: 1 },
    });
  });
});

describe('useOfflineQueue.remove', () => {
  it('clears the specified item', () => {
    useOfflineQueue.getState().enqueue({ endpoint: '/a', method: 'POST', body: null });
    useOfflineQueue.getState().enqueue({ endpoint: '/b', method: 'POST', body: null });

    const [first, second] = useOfflineQueue.getState().queue;
    useOfflineQueue.getState().remove(first.id);

    const queue = useOfflineQueue.getState().queue;
    expect(queue).toHaveLength(1);
    expect(queue[0].id).toBe(second.id);
  });
});

describe('useOfflineQueue.flush', () => {
  it('processes items in FIFO order', async () => {
    const { enqueue } = useOfflineQueue.getState();
    enqueue({ endpoint: '/first', method: 'POST', body: 1 });
    enqueue({ endpoint: '/second', method: 'PUT', body: 2 });
    enqueue({ endpoint: '/third', method: 'DELETE', body: 3 });

    await flush();

    expect(mockApiRequest.mock.calls.map((call) => call[0])).toEqual([
      '/first',
      '/second',
      '/third',
    ]);
    expect(useOfflineQueue.getState().queue).toHaveLength(0);
  });

  it('stops on the first failure and retains the remaining queue', async () => {
    mockApiRequest
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce({ message: 'boom', status: 500 });

    const { enqueue } = useOfflineQueue.getState();
    enqueue({ endpoint: '/first', method: 'POST', body: 1 });
    enqueue({ endpoint: '/second', method: 'POST', body: 2 });
    enqueue({ endpoint: '/third', method: 'POST', body: 3 });

    await flush();

    expect(mockApiRequest).toHaveBeenCalledTimes(2);
    const queue = useOfflineQueue.getState().queue;
    expect(queue.map((item) => item.endpoint)).toEqual(['/second', '/third']);
    expect(queue[0].attempts).toBe(1);
    expect(queue[0].lastError).toBe('boom');
    expect(queue[1].attempts).toBe(0);
  });

  it('drops an item after 5 failed attempts and continues', async () => {

    useOfflineQueue.setState({
      queue: [
        {
          id: 'stuck',
          endpoint: '/stuck',
          method: 'POST',
          body: null,
          createdAt: 1,
          attempts: 4,
        },
        {
          id: 'next',
          endpoint: '/next',
          method: 'POST',
          body: null,
          createdAt: 2,
          attempts: 0,
        },
      ],
    });

    // First call (attempt 5) fails and drops 'stuck'; 'next' then succeeds.
    mockApiRequest
      .mockRejectedValueOnce({ message: 'still down', status: 503 })
      .mockResolvedValueOnce(undefined);

    await flush();

    // 'stuck' hits the 5-attempt cap and is dropped; 'next' still processes.
    expect(mockApiRequest.mock.calls.map((call) => call[0])).toEqual(['/stuck', '/next']);
    expect(useOfflineQueue.getState().queue).toHaveLength(0);
  });

  it('never throws when the API rejects', async () => {
    mockApiRequest.mockRejectedValue({ message: 'nope', status: 500 });
    useOfflineQueue.getState().enqueue({ endpoint: '/x', method: 'POST', body: null });

    await expect(flush()).resolves.toBeUndefined();
  });
});

describe('useOfflineQueue.clear', () => {
  it('empties the queue', () => {
    useOfflineQueue.getState().enqueue({ endpoint: '/a', method: 'POST', body: null });
    useOfflineQueue.getState().clear();

    expect(useOfflineQueue.getState().queue).toHaveLength(0);
  });
});

describe('startOfflineQueueListener', () => {
  it('flushes when connectivity is restored', async () => {
    mockApiRequest.mockResolvedValue(undefined);
    useOfflineQueue.getState().enqueue({ endpoint: '/a', method: 'POST', body: null });

    const unsubscribe = startOfflineQueueListener();
    const handler = mockAddEventListener.mock.calls[0][0];
    handler({ isConnected: true });

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mockApiRequest).toHaveBeenCalledTimes(1);

    unsubscribe();
  });

  it('does not subscribe twice and unsubscribes cleanly', () => {
    const off1 = startOfflineQueueListener();
    const off2 = startOfflineQueueListener();

    expect(mockAddEventListener).toHaveBeenCalledTimes(1);
    off1();
    off2();

    expect(mockUnsubscribe).toHaveBeenCalled();
  });
});
