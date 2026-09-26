/**
 * Tests for the profile document validation and the preference merge rule.
 *
 * These pin the cross-device behaviour: onboarding is read from the cloud
 * when the device has no value, and a device that has never changed a
 * preference adopts the cloud copy while a device that has keeps its own.
 */
import type { UserPreferences } from '@domain/entities';

import {
  isUserProfileDocument,
  parseUserProfile,
  resolvePreferences,
} from '../userProfileDocument';

/** Mirror of the store defaults, kept local so this test stays pure. */
const DEFAULT_PREFERENCES: UserPreferences = {
  unit: 'kg',
  weekStart: 'monday',
  rpeEnabled: false,
  restTimerSeconds: 90,
  notificationsEnabled: true,
};

const CLOUD_PREFERENCES: UserPreferences = {
  unit: 'lb',
  weekStart: 'sunday',
  rpeEnabled: true,
  restTimerSeconds: 120,
  notificationsEnabled: false,
};

describe('parseUserProfile', () => {
  it('accepts a valid profile document', () => {
    const profile = {
      hasOnboarded: true,
      preferences: CLOUD_PREFERENCES,
      createdAt: 1,
      updatedAt: 2,
    };

    expect(isUserProfileDocument(profile)).toBe(true);
    expect(parseUserProfile(profile)).toEqual(profile);
  });

  it('rejects a document with malformed preferences', () => {
    const profile = {
      hasOnboarded: true,
      preferences: { ...CLOUD_PREFERENCES, unit: 'stone' },
    };

    expect(parseUserProfile(profile)).toBeNull();
  });
});

describe('resolvePreferences', () => {
  it('keeps local and pushes it when the cloud has none', () => {
    const local: UserPreferences = { ...DEFAULT_PREFERENCES, unit: 'lb' };

    const merge = resolvePreferences(local, null, DEFAULT_PREFERENCES);

    expect(merge.preferences).toEqual(local);
    expect(merge.pushLocal).toBe(true);
  });

  it('adopts the cloud copy when local is untouched', () => {
    const merge = resolvePreferences(
      DEFAULT_PREFERENCES,
      CLOUD_PREFERENCES,
      DEFAULT_PREFERENCES,
    );

    expect(merge.preferences).toEqual(CLOUD_PREFERENCES);
    expect(merge.pushLocal).toBe(false);
  });

  it('keeps an explicitly changed local preference and pushes it', () => {
    const local: UserPreferences = { ...DEFAULT_PREFERENCES, restTimerSeconds: 45 };

    const merge = resolvePreferences(local, CLOUD_PREFERENCES, DEFAULT_PREFERENCES);

    expect(merge.preferences).toEqual(local);
    expect(merge.pushLocal).toBe(true);
  });
});
