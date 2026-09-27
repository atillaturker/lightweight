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

import {
  setQueueScopeProvider,
  startOfflineQueueListener,
  useOfflineQueue,
  type QueuedMutation,
} from '../offlineQueue';

/** Build a queued item with defaults for the fields under test. */
function makeItem(overrides: Partial<QueuedMutation> = {}): QueuedMutation {
  return {
    id: 'item',
    endpoint: '/item',
    method: 'POST',
    body: null,
    createdAt: 1,
    attempts: 0,
    ...overrides,
  };
}

/** Reset the persisted store between tests. */
function resetQueue(): void {
  useOfflineQueue.setState({ queue: [] });
}

const flush = () => useOfflineQueue.getState().flush();

beforeEach(() => {
  jest.clearAllMocks();
  mockApiRequest.mockResolvedValue(undefined);
  setQueueScopeProvider(null);
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

  it('parks an item after 5 failed attempts, keeps it, and continues', async () => {
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

    // Attempt 5 fails and parks 'stuck'; 'next' then succeeds.
    mockApiRequest
      .mockRejectedValueOnce({ message: 'still down', status: 503 })
      .mockResolvedValueOnce(undefined);

    await flush();

    expect(mockApiRequest.mock.calls.map((call) => call[0])).toEqual(['/stuck', '/next']);
    const queue = useOfflineQueue.getState().queue;
    expect(queue.map((item) => item.id)).toEqual(['stuck']);
    expect(queue[0]).toMatchObject({ failed: true, attempts: 5, lastError: 'still down' });
  });

  it('skips a parked item on later flushes', async () => {
    useOfflineQueue.setState({
      queue: [makeItem({ id: 'parked', endpoint: '/parked', failed: true, attempts: 5 })],
    });

    await flush();

    expect(mockApiRequest).not.toHaveBeenCalled();
    expect(useOfflineQueue.getState().queue).toHaveLength(1);
  });

  it('holds later items for the same endpoint behind a parked item', async () => {
    useOfflineQueue.setState({
      queue: [
        makeItem({ id: 'save', endpoint: '/doc', failed: true, attempts: 5 }),
        makeItem({ id: 'delete', endpoint: '/doc', method: 'DELETE' }),
        makeItem({ id: 'other', endpoint: '/other' }),
      ],
    });

    await flush();

    expect(mockApiRequest.mock.calls.map((call) => call[0])).toEqual(['/other']);
    expect(useOfflineQueue.getState().queue.map((item) => item.id)).toEqual([
      'save',
      'delete',
    ]);
  });

  it('never throws when the API rejects', async () => {
    mockApiRequest.mockRejectedValue({ message: 'nope', status: 500 });
    useOfflineQueue.getState().enqueue({ endpoint: '/x', method: 'POST', body: null });

    await expect(flush()).resolves.toBeUndefined();
  });
});

describe('useOfflineQueue.retryFailed', () => {
  it('gives parked items a fresh set of attempts', async () => {
    useOfflineQueue.setState({
      queue: [makeItem({ id: 'parked', failed: true, attempts: 5 })],
    });

    useOfflineQueue.getState().retryFailed();
    await flush();

    expect(mockApiRequest).toHaveBeenCalledTimes(1);
    expect(useOfflineQueue.getState().queue).toHaveLength(0);
  });
});

describe('useOfflineQueue.flush scope', () => {
  it('holds scoped items while no scope provider is registered', async () => {
    useOfflineQueue.setState({ queue: [makeItem({ scope: 'uid-a' })] });

    await flush();

    expect(mockApiRequest).not.toHaveBeenCalled();
  });

  it('skips another scope without spending an attempt', async () => {
    setQueueScopeProvider(() => 'uid-b');
    useOfflineQueue.setState({
      queue: [
        makeItem({ id: 'a', endpoint: '/a', scope: 'uid-a' }),
        makeItem({ id: 'b', endpoint: '/b', scope: 'uid-b' }),
      ],
    });

    await flush();

    expect(mockApiRequest.mock.calls.map((call) => call[0])).toEqual(['/b']);
    expect(useOfflineQueue.getState().queue).toEqual([
      expect.objectContaining({ id: 'a', attempts: 0 }),
    ]);
  });

  it('delivers the held items once their scope is current', async () => {
    let scope = 'uid-b';
    setQueueScopeProvider(() => scope);
    useOfflineQueue.setState({ queue: [makeItem({ scope: 'uid-a' })] });

    await flush();
    scope = 'uid-a';
    await flush();

    expect(mockApiRequest).toHaveBeenCalledTimes(1);
    expect(useOfflineQueue.getState().queue).toHaveLength(0);
  });
});

describe('useOfflineQueue.flush concurrency', () => {
  it('never delivers an item twice when flushes overlap', async () => {
    let release: () => void = () => undefined;
    mockApiRequest.mockImplementationOnce(
      () => new Promise<void>((resolve) => {
        release = resolve;
      }),
    );
    useOfflineQueue.getState().enqueue({ endpoint: '/once', method: 'POST', body: null });

    const first = flush();
    const second = flush();
    release();
    await Promise.all([first, second]);

    expect(mockApiRequest).toHaveBeenCalledTimes(1);
    expect(useOfflineQueue.getState().queue).toHaveLength(0);
  });

  it('delivers an item enqueued during a running flush', async () => {
    let release: () => void = () => undefined;
    mockApiRequest.mockImplementationOnce(
      () => new Promise<void>((resolve) => {
        release = resolve;
      }),
    );
    const { enqueue } = useOfflineQueue.getState();
    enqueue({ endpoint: '/first', method: 'POST', body: null });

    const running = flush();
    enqueue({ endpoint: '/late', method: 'POST', body: null });
    const joined = flush();
    release();
    await Promise.all([running, joined]);

    expect(mockApiRequest.mock.calls.map((call) => call[0])).toEqual(['/first', '/late']);
    expect(useOfflineQueue.getState().queue).toHaveLength(0);
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
