/**
 * Firestore reads and writes for a user's workout history.
 *
 * Every workout lives at `users/{uid}/workouts/{workoutId}` (see
 * `workoutDocument.ts` for the schema). This module only performs I/O; the
 * shape conversion lives in the pure companion module so it can be tested
 * without the Firebase SDK.
 */
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
} from 'firebase/firestore';

import type { Workout } from '@domain/entities';
import { db } from '@/services/firebase/config';

import { fromWorkoutDocument, toWorkoutDocument } from './workoutDocument';

/** Maximum sessions pulled in one read, mirroring the local history cap. */
export const FIRESTORE_WORKOUT_LIMIT = 500;

/**
 * Reject an empty uid loudly. Silently skipping the write is how a finished
 * session could vanish from the cloud with nothing in the logs.
 */
function requireUid(uid: string): string {
  if (uid.trim() === '') {
    throw new Error('A signed-in uid is required to access workout documents');
  }
  return uid;
}

/** Reference to one document in a user's workout collection. */
function workoutDocRef(uid: string, workoutId: string) {
  return doc(db, 'users', requireUid(uid), 'workouts', workoutId);
}

/** Create or merge one workout document. */
export async function saveWorkoutToFirestore(
  uid: string,
  workout: Workout,
): Promise<void> {
  await setDoc(workoutDocRef(uid, workout.id), toWorkoutDocument(workout), {
    merge: true,
  });
}

/** Delete one workout document. */
export async function deleteWorkoutFromFirestore(
  uid: string,
  workoutId: string,
): Promise<void> {
  await deleteDoc(workoutDocRef(uid, workoutId));
}

/**
 * Read a user's most recent workouts, newest first. Documents that fail
 * validation are skipped rather than rejecting the whole read, so one bad
 * record cannot blank the screen.
 */
export async function fetchWorkoutsFromFirestore(
  uid: string,
  max: number = FIRESTORE_WORKOUT_LIMIT,
): Promise<Workout[]> {
  const ref = collection(db, 'users', requireUid(uid), 'workouts');
  const snapshot = await getDocs(
    query(ref, orderBy('startedAt', 'desc'), limit(max)),
  );
  const workouts: Workout[] = [];
  for (const entry of snapshot.docs) {
    try {
      workouts.push(fromWorkoutDocument(entry.id, entry.data()));
    } catch {
      // Skip unreadable documents; a valid subset still renders.
    }
  }
  return workouts;
}
