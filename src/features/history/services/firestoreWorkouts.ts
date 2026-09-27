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

import {
  fromWorkoutDocument,
  isWorkoutTombstone,
  toWorkoutDocument,
  toWorkoutTombstone,
} from './workoutDocument';

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

/**
 * Delete one workout. With `startedAt`, the document is replaced by a
 * tombstone so other devices learn about the delete; without it (mutations
 * queued before tombstones existed) the document is removed outright.
 */
export async function deleteWorkoutFromFirestore(
  uid: string,
  workoutId: string,
  startedAt?: number,
): Promise<void> {
  const ref = workoutDocRef(uid, workoutId);
  if (startedAt === undefined) {
    await deleteDoc(ref);
    return;
  }
  await setDoc(ref, toWorkoutTombstone(workoutId, startedAt, Date.now()));
}

/** A user's cloud history as read in one query. */
export interface RemoteHistory {
  /** Live workouts, newest first. */
  workouts: Workout[];
  /** Ids of workouts deleted on any device. */
  deletedIds: string[];
  /**
   * `startedAt` of the oldest document read when the read hit its limit,
   * or `null` when the read returned the user's whole history. Anything
   * older than this was simply not read, so its absence proves nothing.
   */
  truncatedBefore: number | null;
}

/**
 * Read a user's most recent workouts and tombstones, newest first.
 * Documents that fail validation are skipped rather than rejecting the
 * whole read, so one bad record cannot blank the screen.
 */
export async function fetchWorkoutsFromFirestore(
  uid: string,
  max: number = FIRESTORE_WORKOUT_LIMIT,
): Promise<RemoteHistory> {
  const ref = collection(db, 'users', requireUid(uid), 'workouts');
  const snapshot = await getDocs(
    query(ref, orderBy('startedAt', 'desc'), limit(max)),
  );
  const history: RemoteHistory = { workouts: [], deletedIds: [], truncatedBefore: null };
  let oldest: number | null = null;
  for (const entry of snapshot.docs) {
    const data: unknown = entry.data();
    if (isWorkoutTombstone(data)) {
      history.deletedIds.push(entry.id);
      oldest = data.startedAt;
      continue;
    }
    try {
      const workout = fromWorkoutDocument(entry.id, data);
      history.workouts.push(workout);
      oldest = workout.startedAt;
    } catch {
      // Skip unreadable documents; a valid subset still renders.
    }
  }
  if (snapshot.docs.length >= max) history.truncatedBefore = oldest;
  return history;
}
