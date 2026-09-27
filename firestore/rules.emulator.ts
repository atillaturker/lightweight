/**
 * Firestore security rules tests. Run with `npm run test:rules`, which
 * starts the emulator; the app's `npm test` does not include this file.
 */
import { readFileSync } from 'fs';
import { resolve } from 'path';

import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { deleteDoc, doc, getDoc, setDoc } from 'firebase/firestore';

const PREFERENCES = {
  unit: 'kg',
  weekStart: 'monday',
  rpeEnabled: false,
  restTimerSeconds: 90,
  notificationsEnabled: true,
};

const PROFILE = {
  hasOnboarded: true,
  preferences: PREFERENCES,
  createdAt: 1,
  updatedAt: 1,
};

const WORKOUT = {
  id: 'w-1',
  routineId: null,
  routineName: 'Push',
  startedAt: 1,
  finishedAt: 2,
  sets: [
    {
      id: 's-1',
      exerciseId: 'bench-press',
      weightKg: 60,
      reps: 5,
      type: 'normal',
      completed: true,
      completedAt: 2,
      order: 0,
    },
  ],
};

let env: RulesTestEnvironment;

/** Firestore as the signed-in `uid`, or unauthenticated for `null`. */
function dbAs(uid: string | null) {
  const context = uid === null ? env.unauthenticatedContext() : env.authenticatedContext(uid);
  return context.firestore();
}

/** Seed documents bypassing the rules. */
async function seed(path: string, data: Record<string, unknown>): Promise<void> {
  await env.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), path), data);
  });
}

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-lightweight',
    firestore: { rules: readFileSync(resolve(__dirname, '../firestore.rules'), 'utf8') },
  });
});

afterAll(async () => {
  await env.cleanup();
});

beforeEach(async () => {
  await env.clearFirestore();
});

describe('users/{uid}', () => {
  it('lets the owner create and read their profile', async () => {
    const db = dbAs('alice');
    await assertSucceeds(setDoc(doc(db, 'users/alice'), PROFILE));
    await assertSucceeds(getDoc(doc(db, 'users/alice')));
  });

  it('denies reading another user profile', async () => {
    await seed('users/alice', PROFILE);
    await assertFails(getDoc(doc(dbAs('bob'), 'users/alice')));
  });

  it('denies writing another user profile', async () => {
    await assertFails(setDoc(doc(dbAs('bob'), 'users/alice'), PROFILE));
  });

  it('denies unauthenticated access', async () => {
    await seed('users/alice', PROFILE);
    await assertFails(getDoc(doc(dbAs(null), 'users/alice')));
    await assertFails(setDoc(doc(dbAs(null), 'users/alice'), PROFILE));
  });

  it('accepts the merge writes the app sends', async () => {
    await seed('users/alice', PROFILE);
    const ref = doc(dbAs('alice'), 'users/alice');
    await assertSucceeds(setDoc(ref, { preferences: PREFERENCES, updatedAt: 2 }, { merge: true }));
    await assertSucceeds(setDoc(ref, { hasOnboarded: true, updatedAt: 3 }, { merge: true }));
  });

  it('rejects unknown fields', async () => {
    await assertFails(setDoc(doc(dbAs('alice'), 'users/alice'), { ...PROFILE, isAdmin: true }));
  });

  it('rejects invalid preferences', async () => {
    const bad = { ...PROFILE, preferences: { ...PREFERENCES, unit: 'stone' } };
    await assertFails(setDoc(doc(dbAs('alice'), 'users/alice'), bad));
  });

  it('denies deleting the profile', async () => {
    await seed('users/alice', PROFILE);
    await assertFails(deleteDoc(doc(dbAs('alice'), 'users/alice')));
  });
});

describe('users/{uid}/workouts/{workoutId}', () => {
  it('lets the owner write, read and delete a workout', async () => {
    const ref = doc(dbAs('alice'), 'users/alice/workouts/w-1');
    await assertSucceeds(setDoc(ref, WORKOUT, { merge: true }));
    await assertSucceeds(getDoc(ref));
    await assertSucceeds(deleteDoc(ref));
  });

  it('denies another user reading or deleting a workout', async () => {
    await seed('users/alice/workouts/w-1', WORKOUT);
    const ref = doc(dbAs('bob'), 'users/alice/workouts/w-1');
    await assertFails(getDoc(ref));
    await assertFails(deleteDoc(ref));
  });

  it('denies another user writing a workout', async () => {
    await assertFails(setDoc(doc(dbAs('bob'), 'users/alice/workouts/w-1'), WORKOUT));
  });

  it('rejects an id that does not match the path', async () => {
    await assertFails(setDoc(doc(dbAs('alice'), 'users/alice/workouts/w-2'), WORKOUT));
  });

  it('rejects a workout missing required fields', async () => {
    const { sets: _sets, ...withoutSets } = WORKOUT;
    await assertFails(setDoc(doc(dbAs('alice'), 'users/alice/workouts/w-1'), withoutSets));
  });

  it('rejects unknown fields', async () => {
    const bad = { ...WORKOUT, extra: 1 };
    await assertFails(setDoc(doc(dbAs('alice'), 'users/alice/workouts/w-1'), bad));
  });
});

describe('workout tombstones', () => {
  const TOMBSTONE = { id: 'w-1', startedAt: 1, deletedAt: 3 };

  it('lets the owner replace a workout with a tombstone', async () => {
    await seed('users/alice/workouts/w-1', WORKOUT);
    await assertSucceeds(setDoc(doc(dbAs('alice'), 'users/alice/workouts/w-1'), TOMBSTONE));
  });

  it('denies another user writing a tombstone', async () => {
    await seed('users/alice/workouts/w-1', WORKOUT);
    await assertFails(setDoc(doc(dbAs('bob'), 'users/alice/workouts/w-1'), TOMBSTONE));
  });

  it('rejects a tombstone that keeps training data', async () => {
    await seed('users/alice/workouts/w-1', WORKOUT);
    const ref = doc(dbAs('alice'), 'users/alice/workouts/w-1');
    await assertFails(setDoc(ref, { deletedAt: 3 }, { merge: true }));
  });

  it('never turns a tombstone back into a workout', async () => {
    await seed('users/alice/workouts/w-1', TOMBSTONE);
    const ref = doc(dbAs('alice'), 'users/alice/workouts/w-1');
    await assertFails(setDoc(ref, WORKOUT));
    await assertFails(setDoc(ref, WORKOUT, { merge: true }));
  });
});

describe('other paths', () => {
  it('denies collections the app does not use', async () => {
    const db = dbAs('alice');
    await assertFails(setDoc(doc(db, 'users/alice/routines/r-1'), { name: 'x' }));
    await assertFails(setDoc(doc(db, 'anything/else'), { a: 1 }));
  });
});
