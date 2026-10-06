# AGENTS.md — Kinetic Strength Analytics

Mobile strength-training app built with React Native (Expo). Users plan
routines, log workouts set by set, and get progression analytics, PRs,
effort and muscle-load insights from their history. Feature-based
architecture with a pure domain layer, hand-built UI against a design
system with light and dark themes, and local-first persistence.

This file covers how the code is built. How it looks is in `/DESIGN.md`.
Per-area rules live in the `AGENTS.md` files listed at the end.

---

## Tech stack

- Expo (managed workflow, SDK 54, dev client)
- TypeScript (strict mode, `moduleResolution: bundler`)
- Zustand for all state, persisted to MMKV; Firestore is a synced mirror
- React Navigation 7 (native-stack + bottom-tabs)
- react-native-mmkv (fast KV persistence)
- Firebase Auth + Firestore (JS SDK)
- react-native-svg (icons, charts, illustrations)
- Space Grotesk + Inter (bundled font assets)

Do not add libraries for state, navigation, UI kits, charts or icons.
Charts and components are hand-built. Expo SDK modules for device
capabilities (keep-awake, haptics, notifications, file system, sharing,
document picker) are fine when a feature needs one; name it in the PR.
Native file access goes through `@infrastructure/files` only.

Path aliases: `@theme`, `@components`, `@domain`, `@features`,
`@infrastructure`, `@lib`, `@/*` (root src). Always use aliases.

---

## Architecture

| Layer                 | Purpose                                             | Import rule                                 |
| --------------------- | --------------------------------------------------- | ------------------------------------------- |
| `src/domain/`         | Entities, value objects, pure business rules        | Zero UI/state/network imports               |
| `src/features/`       | One folder per product feature                      | Screens, components, hooks, services, store |
| `src/components/`     | Cross-feature UI primitives                         | No navigation, no store access              |
| `src/infrastructure/` | Platform implementations (MMKV, network, analytics) | No UI imports                               |
| `src/theme/`          | Design tokens and the theme hook                    | Single source for color/spacing/type        |
| `src/lib/`            | Framework-agnostic utilities                        | No React imports                            |
| `src/app/`            | Navigation root, providers                          | Top of the tree                             |

Imports flow downward only: `app → features → components → domain → theme/lib`.

Between features:

- A feature may import another feature only through its public barrel
  (`@features/<name>`, i.e. its `index.ts`), never a path inside it.
- Feature dependencies must not form a cycle.
- A feature may import from `src/app` only the navigation param lists,
  and only as `import type` from `@/app/navigation/types`.

`src/__tests__/architecture.test.ts` enforces all three.

Training logic (progression, e1RM, effort, muscle load, streaks) is pure
and lives in `src/domain/rules/`, with tests. Features call it; they
never re-implement it.

---

## Pre-code checklist

1. Does a type already exist in `@domain/entities/`? Reuse it.
2. Does a util, hook or rule already do this? Check `@lib/`,
   `@domain/rules/`, `@features/*/utils/` and `@features/*/hooks/`.
3. Are all colors, spacings and type styles coming from `@theme`, through
   `createStyles` / `useTheme`? Does every new color token have both a
   light and a dark value?
4. Which layer does this file belong to? (table above)
5. Does the change touch a synced document shape? Then `firestore.rules`
   and `firestore/rules.emulator.ts` change with it (see "Sync").

---

## Code rules

- TypeScript strict. `any` is forbidden; use `unknown` + type guards.
- Every exported function and component gets a JSDoc block.
- Functions max 40 lines; screen files max 200 lines of JSX. Split
  into components and hooks.
- Named exports everywhere, screens included.
- File names: PascalCase for components, camelCase for utils and hooks.
- Import order: external → `@domain` → `@theme` → local, blank line
  between groups.
- Comments and identifiers in English.
- No `console.log` in committed code.

---

## State management

| Kind           | Tool                   | Rule                                                            |
| -------------- | ---------------------- | --------------------------------------------------------------- |
| User data      | Zustand + MMKV persist | Local-first source of truth; mirrored to Firestore (see "Sync") |
| Client state   | Zustand                | `useShallow` mandatory on object selectors                      |
| Active workout | Zustand + MMKV persist | Writes on every set log. No "save" button.                      |
| Local UI       | `useState`             | Modals, inputs, transient state                                 |

There is no request/response server data: every user-owned record is
local-first and synced. Never use `useEffect` for data fetching. The
one exception is the sync loop in `src/app/providers/useCloudSync.ts`,
which reacts to sign-in and app-foreground events.

### Per-account storage

History, routines, custom exercises, exercise notes, body weight, the
active workout and preferences are persisted per signed-in uid
(`<key>:<uid>` in MMKV).
`src/app/providers/userScope.ts`
switches them synchronously whenever the auth user changes, so one
account never sees or writes another's data, and nothing is deleted on
sign-out (routines and an unfinished workout exist only on the device).
A new user-owned persisted store MUST be added to `userScope.ts` and
export its base key.

### Sync

- Firestore paths: `users/{uid}` (profile),
  `users/{uid}/workouts/{workoutId}`,
  `users/{uid}/exercises/{exerciseId}` (custom exercises) and
  `users/{uid}/bodyweight/{YYYY-MM-DD}`. Shapes live in
  `src/features/profile/services/userProfileDocument.ts`,
  `src/features/history/services/workoutDocument.ts`,
  `src/features/routines/services/customExerciseDocument.ts` and
  `src/features/bodyweight/services/bodyWeightDocument.ts`.
- Custom exercises are never deleted, only archived (logged sets keep
  their ids); on sign-in they merge by id, newer `updatedAt` winning.
- Finished workouts are immutable. Deleting one writes a tombstone
  (`{ id, startedAt, deletedAt }`) instead of removing the document, so
  other devices learn about the delete. A tombstone is final.
- On sign-in and on foreground (at most every 5 minutes),
  `useCloudSync` reads the cloud history and reconciles it with
  `reconcileSessions`: tombstones remove local copies, cloud-only
  sessions are added, local-only sessions are queued for upload.
- Every cloud write that can fail goes through the offline queue
  (`@infrastructure/network`). Queued items carry the owning uid as
  their `scope` and are delivered only while that account is signed
  in. An item that fails 5 times is parked (`failed`), never dropped,
  and retried after the next sign-in sync.
- `firestore.rules` is the access and schema contract. Change it
  together with any document shape, and add a case to
  `firestore/rules.emulator.ts`. New optional fields on a set or
  workout must stay readable by older documents (absent = default).

---

## Theming

The app has a light and a dark theme; palettes and rules are in
`/DESIGN.md` sections 2–5. The user picks System (default), Light or Dark
in Profile → App → Appearance.

How it is wired:

- `src/theme/colors.ts` exports `lightColors` and `darkColors` (same keys,
  type `ColorPalette`). There is no static `colors` export.
- `src/theme/ThemeContext.tsx` provides `useTheme()` → `{ scheme, colors }`
  and `createStyles((colors) => ({ ... }))`, which returns a `useStyles()`
  hook with one cached stylesheet per scheme.
- `src/app/providers/ThemeProvider.tsx` resolves the scheme from the
  appearance choice and the OS, provides it, sets the status bar, the
  root background (`expo-system-ui`) and the native appearance
  (`Appearance.setColorScheme`) so alerts and the keyboard match.
- The appearance choice lives in `useAppearanceStore`
  (`features/profile/store`). It is device-level: not scoped per account
  in `userScope.ts` and not synced to Firestore.

Rules:

- Styles that use a color are built with `createStyles`, and every
  component that reads them calls `const styles = useStyles();` first.
  Colors outside a stylesheet (SVG strokes, placeholder colors) come from
  `const { colors } = useTheme();`.
- No color in module-level constants or default parameter values — they
  are evaluated once, outside the theme. Store a `ColorToken` name and
  resolve it with `colors[token]` inside the component, or resolve a
  default after `useTheme()` (`const color = colorProp ?? colors.x`).
- Pure helpers that need a color take the palette as an argument; never
  call `useTheme()` outside a component or hook.
- Never hard-code a color or branch on the scheme to pick one; add or use
  a token. The only scheme check allowed is choosing between a
  third-party asset's light and dark variants.
- Every new token gets a light and a dark value that meet DESIGN.md §12.
- Tests render without a provider, i.e. in light; assert against
  `lightColors`.

---

## Copy and localization

The UI is English-only for now; localization comes later. Write code so
that it is cheap to add:

- User-facing strings live in components, never in `@domain`.
- Never build a sentence by concatenating fragments
  (`'Lifted ' + n + ' kg'`). Use one template per sentence so it can
  later move into a message catalog with placeholders.
- Format numbers, weights, durations and dates only through the
  `@lib/format` helpers, never inline `toFixed` or manual date strings.
- Exercise names and instructions are data (see below), not UI copy.

---

## Exercise data and media

- The built-in library (~1,170 exercises) is generated by
  `scripts/build-exercise-catalog.mjs` into
  `src/features/routines/data/` (catalog JSON + illustration index) and
  `assets/exercises/` (SVGs), and loaded by
  `src/features/routines/services/exerciseLibrary.ts`. Never edit the
  generated files; change the script and re-run it.
- Exercise ids are stable slugs (`bench-press`): history and PRs are
  keyed on them, so an id is never renamed or reused. The script's
  `CURATED` table pins the original ids; dataset ids live in
  `Exercise.source`.
- Third-party data and media are added only with their license recorded
  in `THIRD_PARTY_NOTICES.md` (source, license, attribution text), and
  only under a license that allows commercial use in a distributed app.
  Attribution is shown on Profile → App → Acknowledgements.
- Never copy code from copyleft projects (GPL, AGPL), even as reference
  material. Re-implement behavior from a written description.
- Exercise illustrations follow DESIGN.md §9 (monoline, tintable,
  no photos).

---

## Navigation

```
Root (conditional)
├── Intro (stack, 2 screens — pre-auth)
├── Auth (stack)
├── Onboarding (stack, 3 setup screens — post-auth)
└── Main (tabs, 4 items)
    ├── TodayTab    (stack: Home → ActiveWorkout → Summary)
    ├── ProgressTab (stack: Progress → ExerciseDetail)
    ├── HistoryTab  (stack: History → SessionDetail → ExerciseDetail)
    └── ProfileTab  (stack: Profile → Routines → RoutineEditor → ExercisePicker)
```

- Root switches on `hasSeenIntro`, the signed-in `user`, and
  `hasOnboarded`, in that order. Intro is never repeated on the same
  install.
- Push screens use `navigation.replace` to avoid stack growth.
- The tab bar is custom (`src/components/TabBar/`); never the default
  React Navigation tab bar.
- Declare a `ParamList` per stack and use `NativeStackScreenProps`.
- A new screen is added to its stack's param list in
  `src/app/navigation/types.ts` and to the tree above.

---

## Design essentials

Full system: `/DESIGN.md`. The rules most often broken:

- Every color, spacing, radius and type style comes from `@theme`.
- Exactly one primary action and one dominant number per screen.
- Accent marks meaning (live state, selection, highlighted data,
  progress), never decoration or a large fill.
- Negative training deltas use `textMuted`, never `error`.
- No gradients, blur, glassmorphism or photography. One subtle shadow,
  only on floating elements, light theme only.
- Icons are monoline `react-native-svg`; `@expo/vector-icons` is
  forbidden.
- `tabular-nums` on every number in a table, stat strip, chart axis or
  timer.
- Both themes are checked before a UI change is done.

---

## Testing

- Every `src/domain/rules/*.ts` has a `__tests__/*.test.ts`.
- Component tests use React Native Testing Library.
- Native modules without a JS fallback (MMKV, Google Sign-In) have Jest
  stand-ins in the root `__mocks__/`. A test's own `jest.mock` wins.
- A new feature ships with at least one integration test of its main
  flow.
- Test names: `describe('functionName')` + `it('does X')`.
- `npm test` runs in `America/New_York` (pinned by
  `jest.globalSetup.js`) so date code is tested west of UTC and across
  daylight saving. Build expected dates with local constructors
  (`new Date(2024, 0, 1)`), never `Date.UTC`.
- `npm run test:rules` runs `firestore/rules.emulator.ts` against the
  Firestore emulator. Requires Java 21.
- Before reporting work as done, run `npm run typecheck`, `npm run lint`
  and `npm test`. Lint uses `eslint-config-expo`; tests may declare
  `jest.mock` before imports (see `eslint.config.js`).

---

## New feature: file order

1. `src/domain/` — entity changes and pure rules, with tests
2. `features/X/types.ts`
3. `features/X/services/` — persistence and sync seams
4. `features/X/store/` — only if client state is needed
5. `features/X/hooks/`
6. `features/X/components/`
7. `features/X/screens/`
8. `features/X/__tests__/`

Never create a screen before its types, service and hook exist.

---

## Prohibitions

- Hard-coded colors, spacings or font sizes. The only exception is the
  Google and Apple sign-in marks in
  `src/features/auth/components/AuthIcons.tsx`.
- `any`.
- `AsyncStorage`, except Firebase Auth's own session persistence in
  `src/services/firebase/config.ts` (`getReactNativePersistence`).
- `useEffect` for data fetching.
- New state, navigation or UI-kit libraries (Redux, MobX, Jotai,
  Recoil, Expo Router, React Native Paper, NativeBase, Tamagui, chart
  libraries).
- Two primary buttons on one screen.
- Chart types DESIGN.md §5.4 forbids (pie, multi-segment donut, 3D,
  radar, dual axis).
- Code copied from GPL/AGPL projects; media or data without a recorded
  license.
- `console.log` in committed code.
- Edits under `src/_legacy/` — it exists only for reference.

---

## Current project status

- **Auth**: `src/features/auth/` (email/password, Google, Apple).
  `src/services/firebase/config.ts` initializes Firebase and is the
  only file left under `src/services/`.
- **Onboarding, Workout, Routines, Analytics, History, Profile**:
  implemented under `src/features/`.
- **Backend**: Firebase Auth + Firestore. Workouts, custom exercises,
  body weight, the profile and preferences sync (see "Sync"). Routines
  are local-only.
- **Exercise library**: 1,170 exercises from exercises-dataset (MIT),
  106 with Everkinetic illustrations (CC BY-SA 4.0). See
  `THIRD_PARTY_NOTICES.md`.
- **Theming**: light and dark themes, System / Light / Dark choice
  (see "Theming").
- **Language**: English only.
- **Not released yet.** Data migrations may assume development
  installs.

---

## When to read which file

| Task                       | Read                                 |
| -------------------------- | ------------------------------------ |
| Any UI work                | `/DESIGN.md`                         |
| Writing a new component    | `/src/components/AGENTS.md`          |
| Adding a calculation       | `/src/domain/AGENTS.md`              |
| Working on workout logging | `/src/features/workout/AGENTS.md`    |
| Working on analytics       | `/src/features/analytics/AGENTS.md`  |
| Working on auth            | `/src/features/auth/AGENTS.md`       |
| Working on onboarding      | `/src/features/onboarding/AGENTS.md` |
| Working on routines        | `/src/features/routines/AGENTS.md`   |
| Working on history         | `/src/features/history/AGENTS.md`    |
| Working on profile         | `/src/features/profile/AGENTS.md`    |
| Working on body weight     | `/src/features/bodyweight/AGENTS.md` |
| Working on export/import   | `/src/features/backup/AGENTS.md`     |

---

## Examples of correct code

**Domain rule:**

```ts
// src/domain/rules/e1rm.ts

/**
 * Estimate 1RM using the Epley formula.
 * Single-rep sets return the raw weight.
 */
export function calculateE1RM(weightKg: number, reps: number): number {
  if (reps <= 0) throw new Error('reps must be positive');
  if (reps === 1) return weightKg;
  return weightKg * (1 + reps / 30);
}
```

**Persisted, per-account store:**

```ts
// src/features/workout/store/activeWorkoutStore.ts
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { zustandStorage } from '@infrastructure/storage';

/** Base MMKV key; the app layer scopes it per signed-in user. */
export const ACTIVE_WORKOUT_STORE_KEY = 'active-workout';

export const useActiveWorkoutStore = create<ActiveWorkoutState>()(
  persist(
    (set) => ({
      sessionId: null,
      discardWorkout: () => set({ sessionId: null }),
    }),
    {
      name: ACTIVE_WORKOUT_STORE_KEY,
      storage: createJSONStorage(() => zustandStorage),
    },
  ),
);
```

**Screen:**

```ts
// src/features/workout/screens/ActiveWorkoutScreen.tsx
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { TodayStackParamList } from '@/app/navigation/types';

type Props = NativeStackScreenProps<TodayStackParamList, 'ActiveWorkout'>;

export function ActiveWorkoutScreen({ route, navigation }: Props) {
  // ...
}
```

---

## Verification rule

Before reporting "tests passed" or "tsc clean", run the command yourself
in the current environment and paste the actual output (trimmed). Do not
report a result you did not observe.

If a command cannot run in the current environment (missing dependency,
wrong node version, etc.), report it as FAILED, not as
PASSED-with-workaround. Never silently work around a broken environment.
