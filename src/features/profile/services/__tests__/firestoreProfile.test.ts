/**
 * Firestore profile service tests.
 *
 * Pins the two behaviours that fix the empty-database bug: an empty uid is
 * rejected loudly instead of silently no-opping, and a missing profile is
 * created with the device's current state.
 */
import type { UserPreferences } from '@domain/entities';

const mockGetDoc = jest.fn();
const mockSetDoc = jest.fn();

jest.mock('firebase/firestore', () => ({
  doc: jest.fn((_db: unknown, ...segments: string[]) => ({
    path: segments.join('/'),
  })),
  getDoc: (...args: unknown[]) => mockGetDoc(...args),
  setDoc: (...args: unknown[]) => mockSetDoc(...args),
}));

jest.mock('@/services/firebase/config', () => ({ db: { name: 'test-db' } }));

import {
  createUserProfile,
  fetchUserProfile,
  saveUserPreferences,
} from '../firestoreProfile';

const PREFERENCES: UserPreferences = {
  unit: 'kg',
  weekStart: 'monday',
  rpeEnabled: false,
  restTimerSeconds: 90,
  notificationsEnabled: true,
};

beforeEach(() => {
  jest.clearAllMocks();
  mockSetDoc.mockResolvedValue(undefined);
});

describe('empty uid handling', () => {
  it('rejects a preference write with an empty uid instead of skipping', async () => {
    await expect(saveUserPreferences('', PREFERENCES)).rejects.toThrow(
      /signed-in uid/,
    );
    expect(mockSetDoc).not.toHaveBeenCalled();
  });

  it('rejects a profile read with an empty uid', async () => {
    await expect(fetchUserProfile('')).rejects.toThrow(/signed-in uid/);
    expect(mockGetDoc).not.toHaveBeenCalled();
  });
});

describe('createUserProfile', () => {
  it('writes the document with preferences and timestamps', async () => {
    await createUserProfile('uid-1', {
      hasOnboarded: true,
      preferences: PREFERENCES,
    });

    expect(mockSetDoc).toHaveBeenCalledTimes(1);
    const [ref, document] = mockSetDoc.mock.calls[0];
    expect(ref.path).toBe('users/uid-1');
    expect(document).toMatchObject({
      hasOnboarded: true,
      preferences: PREFERENCES,
    });
    expect(typeof document.createdAt).toBe('number');
    expect(typeof document.updatedAt).toBe('number');
  });
});

describe('fetchUserProfile', () => {
  it('returns null when the document does not exist', async () => {
    mockGetDoc.mockResolvedValue({ exists: () => false });

    await expect(fetchUserProfile('uid-1')).resolves.toBeNull();
  });
});
