# AGENTS.md — Backup feature

Export the signed-in account's data to a JSON file and import a backup
or a shared routine file. No screens: Profile's Data rows call
`useBackupActions` (through `profile/hooks/useDataActions`).

## Files

- `types.ts` — `BackupFile` (on disk) and `BackupData` (domain types).
- `services/backupDocument.ts` — pure build and parse. Reading reuses
  the sync validators (`isWorkoutDocument`, `isCustomExerciseDocument`,
  `isBodyWeightDocument`, `parseRoutine`); malformed entries are skipped
  and counted, never imported.
- `hooks/useBackupActions.ts` — reads the stores, writes and shares the
  file, and applies an import through each feature's own action.

## Format

`{ format: 'kinetic-backup', version: 1, exportedAt, workouts,
routines, scheduleOverrides, customExercises, exerciseNotes,
bodyWeight }`. Workouts, custom exercises and body weight use their
Firestore document shapes; weights are always kg. A routine share file
(`format: 'kinetic-routines'`, built in the routines feature) is
accepted by the same import. A file with a newer `version` is refused.
Bump the version and keep reading the old one when the shape changes.

Preferences and appearance are not in the backup: they already sync
with the profile, and appearance is device-level.

## Import rules

- Merge, never replace. Workouts and routines are added only when their
  id is new; custom exercises, notes and body-weight days take the newer
  `updatedAt`; schedule changes fill only dates with none.
- Every added or changed record goes through its feature's action
  (`importSessions`, `importEntries`, `importRoutineData`), so it is
  mirrored to the cloud like any local change. A workout tombstoned in
  the cloud is removed again on the next sync; tombstones are final.
- Order: custom exercises and routines before workouts.

## Do not

- Do not read or write files outside `@infrastructure/files`.
- Do not import `@features/profile` (Profile depends on this feature).
