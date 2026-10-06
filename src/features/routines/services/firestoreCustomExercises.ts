/**
 * Firestore reads and writes for a user's custom exercises at
 * `users/{uid}/exercises/{exerciseId}`. I/O only; shapes live in
 * `customExerciseDocument.ts`. Not exported from the services barrel, so
 * local-only code never loads the Firebase SDK.
 */
import { collection, doc, getDocs, setDoc } from 'firebase/firestore';

import type { Exercise } from '@domain/entities';
import { db } from '@/services/firebase/config';

import {
  fromCustomExerciseDocument,
  isCustomExerciseDocument,
  toCustomExerciseDocument,
} from './customExerciseDocument';

/** Reject an empty uid loudly instead of writing to the wrong path. */
function requireUid(uid: string): string {
  if (uid.trim() === '') {
    throw new Error('A signed-in uid is required to access custom exercises');
  }
  return uid;
}

/** Create or replace one custom-exercise document. */
export async function saveCustomExerciseToFirestore(uid: string, exercise: Exercise): Promise<void> {
  const ref = doc(db, 'users', requireUid(uid), 'exercises', exercise.id);
  await setDoc(ref, toCustomExerciseDocument(exercise));
}

/** Every valid custom exercise the user has in the cloud. */
export async function fetchCustomExercisesFromFirestore(uid: string): Promise<Exercise[]> {
  const snapshot = await getDocs(collection(db, 'users', requireUid(uid), 'exercises'));
  const exercises: Exercise[] = [];
  for (const entry of snapshot.docs) {
    const data: unknown = entry.data();
    if (isCustomExerciseDocument(data)) exercises.push(fromCustomExerciseDocument(data));
    else console.warn('[firestore] skipping invalid custom exercise', entry.id);
  }
  return exercises;
}
