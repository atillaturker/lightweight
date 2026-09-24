# Task 07 — Domain layer

Build the entire domain layer: entities, value objects, and business
rules. This is the pure calculation core of the product. Every future
feature imports from here. It must be correct, typed, and tested.

Read first:
/AGENTS.md
/src/domain/AGENTS.md
/DESIGN.md (the section on metrics and PRs)

Do NOT read any file under /src/\_legacy/.
Do NOT read any file under /src/features/.
Do NOT read any component file.

---

## Constraints (from AGENTS.md)

- Pure TypeScript only. No React, no React Native, no navigation,
  no state libraries, no network, no I/O, no side effects.
- No imports from features/, components/, infrastructure/, or theme/.
- Every exported function and type has a JSDoc block.
- Plain `Error` with a clear message when throwing. No custom error classes.
- Functions max 40 lines. Split if longer.
- Named exports only.
- Test file for every rule file. Test names describe behavior:
  `it('excludes warmup sets from volume')`.

---

## File structure to create

/src/domain/
entities/
Exercise.ts
Set.ts
Workout.ts
Routine.ts
User.ts
index.ts
value-objects/
Weight.ts
Volume.ts
E1RM.ts
index.ts
rules/
e1rm.ts
volume.ts
pr.ts
streak.ts
delta.ts
index.ts
**tests**/
e1rm.test.ts
volume.test.ts
pr.test.ts
streak.test.ts
delta.test.ts

That is 21 files total.

---

## ENTITIES

### Exercise.ts

```ts
export type MuscleGroup =
  | 'chest' | 'back' | 'legs' | 'shoulders' | 'arms';

export type Equipment =
  | 'barbell' | 'dumbbell' | 'cable' | 'machine' | 'bodyweight';

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  equipment: Equipment;
  pictogramId: string;   // key for the SVG sprite, e.g. "ex-bench-press"
  isCustom: boolean;
  isArchived: boolean;
  createdAt: number;
}
export type SetType = 'normal' | 'warmup' | 'drop' | 'failure';

export interface Set {
  id: string;
  exerciseId: string;
  workoutId: string;
  weightKg: number;      // always kg — conversion happens at the UI edge
  reps: number;
  type: SetType;
  completed: boolean;
  rpe?: number;          // 1-10, optional
  note?: string;
  completedAt: number | null;
  order: number;         // position within its exercise
}

export interface Workout {
  id: string;
  routineId: string | null;   // null if started without a routine
  routineName: string;        // snapshot — routine may be renamed later
  startedAt: number;
  finishedAt: number | null;
  sets: Set[];
  note?: string;
}

export interface RoutineExercise {
  exerciseId: string;
  targetSets: number;
  targetReps: number;
  order: number;
  supersetGroup?: string;   // e.g. "A1", "A2"
}

export interface Routine {
  id: string;
  name: string;
  exercises: RoutineExercise[];
  createdAt: number;
  updatedAt: number;
  isArchived: boolean;
}

export type WeightUnit = 'kg' | 'lb';
export type WeekStart = 'monday' | 'sunday';

export interface UserPreferences {
  unit: WeightUnit;
  weekStart: WeekStart;
  rpeEnabled: boolean;
  restTimerSeconds: number;
  notificationsEnabled: boolean;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  preferences: UserPreferences;
  hasOnboarded: boolean;
  createdAt: number;
}

Each entity file also exports a matching index.ts re-export.

VALUE OBJECTS
Weight.ts
Immutable class. Stores kg internally.

static fromKg(kg: number): Weight — throws on negative

static fromLb(lb: number): Weight — throws on negative

toKg(): number

toLb(): number

format(unit: WeightUnit): string — e.g. "80 kg", "176.4 lb"

Rounding: 1 decimal on lb, integer or 1 decimal on kg (use Number.toFixed(1) and strip trailing .0)

Volume.ts
A plain type + helper. Volume = Σ (weightKg × reps) for a set list,
excluding warmup sets.

export interface VolumeSummary {
  total: number;         // in kg
  sets: number;          // working sets (excludes warmup)
  reps: number;
  perExercise: Record<string, number>;   // exerciseId → volume
}

export interface E1RMResult {
  value: number;              // kg
  sourceSet: { weightKg: number; reps: number };
}

/**
 * Estimate 1RM using the Epley formula.
 * Single-rep sets return the raw weight.
 * Throws if reps <= 0 or weightKg < 0.
 */
export function calculateE1RM(weightKg: number, reps: number): number;

/**
 * Find the best estimated 1RM across a list of sets.
 * Ignores warmup sets and uncompleted sets.
 * Returns null if no valid sets exist.
 */
export function bestE1RM(sets: Set[]): E1RMResult | null;

/**
 * Calculate total volume (kg) for a list of sets.
 * Warmup sets are excluded.
 * Uncompleted sets are excluded.
 */
export function calculateVolume(sets: Set[]): number;

/**
 * Full breakdown including per-exercise totals.
 */
export function summarizeVolume(sets: Set[]): VolumeSummary;

/**
 * Group sessions by ISO week (respecting the given weekStart)
 * and return the total volume per week.
 */
export function weeklyVolume(
  sessions: Workout[],
  weekStart: WeekStart,
): Array<{ weekStartMs: number; volume: number }>;
```

export type PRType = 'heaviest_set' | 'best_1rm' | 'most_reps' | 'best_session_volume';

export interface PRRecord {
type: PRType;
exerciseId: string;
value: number; // kg for weight-based, reps for most_reps, kg for volume
repsAtWeight?: number; // for heaviest_set: reps achieved
achievedAt: number;
}

/\*\*

- Given historical sets for an exercise and a new set,
- return the PRs the new set achieves. Empty array if none.
- Warmup sets never count.
  \*/
  export function detectPRs(historicalSets: Set[], newSet: Set): PRRecord[];

/\*\*

- Return all-time PR records for one exercise, one per PR type.
- Returns an empty array if the exercise has no valid history.
  \*/
  export function bestRecordsForExercise(sets: Set[]): PRRecord[];

PR rules (do not deviate):

heaviest_set: heaviest weight ever, requires reps >= 1

best_1rm: highest Epley estimate

most_reps: most reps at any weight where weight >= previous heaviest at that rep count — do NOT use a naive "max reps" — use "max reps at the heaviest weight recorded for that rep count"

best_session_volume: only detected after a session ends, not per set. detectPRs never returns this type.

/\*\*

- Weekly streak. Consecutive ISO weeks (based on weekStart)
- containing at least one finished workout.
-
- A "quick session" (under 30 minutes) does NOT count toward streak.
- A workout with no completed working sets does NOT count.
-
- Returns 0 if there is no current streak.
  \*/
  export function currentWeeklyStreak(
  sessions: Workout[],
  weekStart: WeekStart,
  now: number,
  ): number;

/\*\*

- Longest streak ever achieved.
  \*/
  export function longestWeeklyStreak(
  sessions: Workout[],
  weekStart: WeekStart,
  ): number;

/\*\*

- Percent change from previous to current.
- Returns null when previous is 0 or missing — the UI hides the delta
- line on null rather than showing "0%" or "—".
  \*/
  export function calculateDelta(current: number, previous: number): number | null;

TESTS
Every rule file gets a test file. Cover the edge cases below:

e1rm.test.ts

single rep returns raw weight

multiple reps applies Epley formula

throws on reps <= 0

throws on negative weight

bestE1RM ignores warmup sets

bestE1RM ignores uncompleted sets

bestE1RM returns null on empty input

volume.test.ts

excludes warmup sets

excludes uncompleted sets

sums weight × reps correctly

per-exercise breakdown is correct

weeklyVolume groups sessions by week

weeklyVolume respects weekStart = sunday

pr.test.ts

detects heaviest_set on first-ever set

does not detect heaviest_set on a lighter set

detects best_1rm only when Epley estimate beats prior best

detects most_reps correctly (highest reps at a NEW heaviest weight)

never counts warmup sets

returns empty array when no PR achieved

streak.test.ts

returns 0 with no sessions

returns 1 for a single current-week session

breaks on a missing week

ignores sessions under 30 minutes

ignores sessions with no completed working sets

longestWeeklyStreak finds the historical maximum

delta.test.ts

returns null when previous is 0

returns null when previous is negative

computes positive delta

computes negative delta

returns 0 when current equals previous

Index files
Each folder gets an index.ts that re-exports its public API.
Do not use export \*. Be explicit:export type { Exercise, MuscleGroup, Equipment } from './Exercise';

DELIVERABLES
After creating the files, output ONLY this:

Files created: N
tsc: <clean | error count>
jest src/domain: <X passed, Y failed>
Judgment calls: max 3 bullet points

Do not paste code. Do not paste test output. Do not restate the spec.

Then stop.
