/**
 * Firestore reads and writes for body weight at
 * `users/{uid}/bodyweight/{YYYY-MM-DD}`. I/O only; not exported from the
 * services barrel, so local-only code never loads the Firebase SDK.
 */
import { collection, doc, getDocs, setDoc } from 'firebase/firestore';

import type { BodyWeightEntry } from '@domain/entities';
import { db } from '@/services/firebase/config';

import {
  fromBodyWeightDocument,
  isBodyWeightDocument,
  toBodyWeightDocument,
} from './bodyWeightDocument';

/** Reject an empty uid loudly instead of writing to the wrong path. */
function requireUid(uid: string): string {
  if (uid.trim() === '') throw new Error('A signed-in uid is required to access body weight');
  return uid;
}

/** Create or replace one day's entry (removals included). */
export async function saveBodyWeightToFirestore(uid: string, entry: BodyWeightEntry): Promise<void> {
  await setDoc(doc(db, 'users', requireUid(uid), 'bodyweight', entry.date), toBodyWeightDocument(entry));
}

/** Every valid entry the user has in the cloud, removals included. */
export async function fetchBodyWeightFromFirestore(uid: string): Promise<BodyWeightEntry[]> {
  const snapshot = await getDocs(collection(db, 'users', requireUid(uid), 'bodyweight'));
  const entries: BodyWeightEntry[] = [];
  for (const entry of snapshot.docs) {
    const data: unknown = entry.data();
    if (isBodyWeightDocument(data) && data.date === entry.id) entries.push(fromBodyWeightDocument(data));
    else console.warn('[firestore] skipping invalid body weight entry', entry.id);
  }
  return entries;
}
