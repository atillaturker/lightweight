# AGENTS.md — Body weight feature

The user's body-weight log. The Progress screen (analytics) renders the
section (`BodyWeightSection`); this feature owns the data, its sync and
the log sheet.

## Model

- One `BodyWeightEntry` per local calendar day (`date: YYYY-MM-DD`,
  `isoDay` in `@domain/rules/bodyWeight`). Logging again that day
  replaces the entry.
- Weight is always kg; the sheet converts from the user's unit and
  rejects values outside 20–500 kg with an inline error (the Save button
  is never disabled).
- Removing an entry keeps it as a tombstone (`deleted: true`, newer
  `updatedAt`) so other devices learn about it. A tombstone is replaced
  only by a newer log of the same day.

## Storage and sync

- `useBodyWeightStore` is per account (`userScope.ts`).
- Writes go through `useBodyWeightActions`, which mirrors each change to
  the cloud seam (`syncBodyWeightToCloud`); the app layer writes it or
  queues it offline.
- Firestore: `users/{uid}/bodyweight/{YYYY-MM-DD}`; shape in
  `services/bodyWeightDocument.ts`; `firestore.rules` validates it and
  denies deletes. On sign-in, `mergeBodyWeight` unions per day (newer
  `updatedAt` wins) and queues the local wins.
- `services/firestoreBodyWeight.ts` imports the Firebase SDK and is not
  exported from the barrel; only `src/app` imports it.

## Do not

- Do not colour a weight change green or red: whether down is good
  depends on the user's goal. Changes stay `textMuted`.
- Do not hard-delete entries locally or in Firestore.
