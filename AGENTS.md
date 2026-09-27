# AGENTS.md — Kinetic Strength Analytics

Mobile strength-training analytics app built with React Native (Expo).
Users log workouts; the app turns training history into progression
analytics, PRs, and strength curves. Feature-based architecture with a
pure domain layer, hand-built UI against a strict design system, and a
local-first persistence strategy.

---

## Tech stack

- Expo (managed workflow, SDK 54, dev client)
- TypeScript (strict mode, `moduleResolution: bundler`)
- Zustand for all state, persisted to MMKV; Firestore is a synced mirror
- React Navigation 7 (native-stack + bottom-tabs)
- react-native-mmkv (fast KV persistence)
- Firebase Auth + Firestore (JS SDK)
- react-native-svg (custom icons only)
- Space Grotesk + Inter (bundled font assets)

Do NOT add new libraries for state, navigation, or UI. All UI is
hand-built against the design system.

Path aliases: `@theme`, `@components`, `@domain`, `@features`,
`@infrastructure`, `@lib`, `@/*` (root src). Always use aliases.

---

## Architecture layers

| Layer                 | Purpose                                             | Import rule                                 |
| --------------------- | --------------------------------------------------- | ------------------------------------------- |
| `src/domain/`         | Entities, value objects, pure business rules        | Zero UI/state/network imports               |
| `src/features/`       | One folder per product feature                      | Screens, components, hooks, services, store |
| `src/components/`     | Cross-feature UI primitives                         | No navigation, no store access              |
| `src/infrastructure/` | Platform implementations (MMKV, network, analytics) | No UI imports                               |
| `src/theme/`          | Design tokens                                       | Single source for color/spacing/type        |
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

---

## Pre-code checklist

Before writing any code:

1. Does a type for this already exist in `@domain/entities/`?
   Reuse it. Never redefine.
2. Are you using tokens from `@theme`?
   Hard-coded colors and spacings are FORBIDDEN. Use `spacing` for new
   layouts; `fineSpacing` and `emptyStatePadding` exist only for the few
   named off-scale values, each with one job.
3. Does a util or hook already do this?
   Check `@lib/` and `@features/*/utils/`, `@features/*/hooks/`.
   Never duplicate logic.
4. Which layer does this file belong to?
   See the architecture table above.

---

## Code rules

- TypeScript strict. `any` is FORBIDDEN. Use `unknown` + type guards.
- Every exported function and component gets a JSDoc block.
- Functions max 40 lines. Split if longer.
- Named exports everywhere, screens included.
- File names: PascalCase for components, camelCase for utils and hooks.
- Import order: external → `@domain` → `@theme` → local. Blank line between groups.
- Comments in English.

---

## State management

| Kind           | Tool                   | Rule                                                                  |
| -------------- | ---------------------- | --------------------------------------------------------------------- |
| User data      | Zustand + MMKV persist | Local-first source of truth; mirrored to Firestore (see "Sync")       |
| Client state   | Zustand                | `useShallow` MANDATORY on object selectors                            |
| Active workout | Zustand + MMKV persist | Writes on every set log. No "save" button.                            |
| Local UI       | `useState`             | Modals, inputs, transient state                                       |

There is no request/response server data: every user-owned record is
local-first and synced (see "Sync"). Add a server-state library only
together with a backend that needs one.

Never use `useEffect` for data fetching. The one exception is the sync
loop in `src/app/providers/useCloudSync.ts`, which reacts to sign-in and
app-foreground events rather than rendering fetched data.

### Per-account storage

History, routines, the active workout and preferences are persisted per
signed-in uid (`<key>:<uid>` in MMKV). `src/app/providers/userScope.ts`
switches them synchronously whenever the auth user changes, so one account
never sees or writes another's data, and nothing is deleted on sign-out
(routines and an unfinished workout exist only on the device). A new
user-owned persisted store MUST be added to `userScope.ts` and export its
base key.

### Sync

- Firestore paths: `users/{uid}` (profile) and
  `users/{uid}/workouts/{workoutId}`. Shapes live in
  `src/features/profile/services/userProfileDocument.ts` and
  `src/features/history/services/workoutDocument.ts`.
- Finished workouts are immutable. Deleting one writes a tombstone
  (`{ id, startedAt, deletedAt }`) instead of removing the document, so
  other devices learn about the delete. A tombstone is final.
- On sign-in and on foreground (at most every 5 minutes),
  `useCloudSync` reads the cloud history and reconciles it with
  `reconcileSessions`: tombstones remove local copies, cloud-only sessions
  are added, local-only sessions are queued for upload.
- Every cloud write that can fail goes through the offline queue
  (`@infrastructure/network`). Queued items carry the owning uid as their
  `scope` and are delivered only while that account is signed in. An item
  that fails 5 times is parked (`failed`), never dropped, and retried
  after the next sign-in sync.
- `firestore.rules` is the access and schema contract. Change it together
  with any document shape, and add a case to `firestore/rules.emulator.ts`.

---

## Navigation

Root (conditional)
├── Intro (stack, 2 screens — pre-auth)
├── Auth (stack)
├── Onboarding (stack, 3 setup screens — post-auth)
└── Main (tabs, 4 items)
├── TodayTab (stack: Home → ActiveWorkout → Summary)
├── ProgressTab (stack: Progress → ExerciseDetail)
├── HistoryTab (stack: History → SessionDetail → ExerciseDetail)
└── ProfileTab (stack: Profile → Routines → RoutineEditor → ExercisePicker)

- Root switches on `hasSeenIntro`, the signed-in `user`, and `hasOnboarded`, in
  that order. Intro is shown before auth and is never repeated on the
  same install.
- Push screens use `navigation.replace` to avoid stack growth.
- Tab bar is custom: `src/components/TabBar/`. Do NOT use the default
  React Navigation tab bar.
- Tab icons: inline `react-native-svg`. `@expo/vector-icons` is FORBIDDEN.
- Always declare `ParamList` per stack and use `NativeStackScreenProps`.

---

## Design system summary

Full reference: `/DESIGN.md`.

- Canvas `#FFFFFF`, primary `#111111`, accent `#3B82F6`.
  Accent appears at most three times per screen and only to mark a
  selection, a live state, or a single data point. Never as a fill.
  See "Design enrichment rules (v2)" for the priority order.
- Surface `#F5F5F5`, hairline `#E5E7EB`, body text `#374151`, muted `#6B7280`.
- Success `#10B981` and error `#EF4444` are state colors only.
  Never use `#EF4444` for a negative delta in a training context —
  use `#6B7280`. A dip can mean a deload.
- Typography: Space Grotesk for display (600 weight, negative tracking),
  Inter for everything else. `fontVariant: ['tabular-nums']` on every
  numeric value in tables or stat strips.
- Radii: 8px controls, 12px cards, 16px stages, pill for badges.
- No shadows. No blur. No gradients. No neumorphism.
- Exactly ONE primary action per screen.

---

## Design enrichment rules (v2)

Seven targeted relaxations so the app reads clearly on a 390px
mobile screen. They override only the items below; everything else in
"Design system summary" and `/DESIGN.md` remains in force.

1. Section headers carry more presence.
   Render them Inter 12px / 600, `colors.textMuted`, uppercase, 0.06em
   tracking. Keep the color; 11px / 500 disappears on a bright screen,
   12px / 600 stays legible without turning loud.

2. Accent may appear up to three times per screen, in this priority
   order:
   1. A live or active state (active routine dot, active session
      indicator, focused tab underline).
   2. A single data highlight (fastest-improving lift, latest chart
      data point).
   3. A focus ring or selection border on a form control.
   Never a background fill. Never more than three.

3. Flat cards are permitted for grouping related data.
   Use `colors.canvas` (#FFFFFF) fill, a 1px `colors.hairline` border,
   12px radius, and 16px inner padding. No shadow. Never nested. Use
   at most 2–3 per screen, and only when the border answers "these
   items belong together" — if proximity and hairlines already group
   them, do not add a card.

4. One soft background block per screen is permitted.
   A `colors.surface` (#F5F5F5) fill on a 12px-radius container may
   group rows of the same type (e.g. "This week" metrics). No border,
   16px inner padding, never nested. At most one per screen.

5. Icons are encouraged when they add meaning.
   Monoline 1.5px SVG icons may be added before a list row's label
   when they convey the item's category (muscle group, exercise
   equipment, workout type), in section headers, and in empty states.
   Every icon must communicate something the text does not. No icon
   without a job.

6. One exception to the no-shadow rule.
   A single, very subtle shadow `0 1px 2px rgba(0,0,0,0.04)` is
   permitted on the pinned bottom CTA bar when it sits above
   scrollable content, and on bottom sheets against the modal
   backdrop. No other element receives a shadow. Never a colored
   shadow, never diffuse, never blur-heavy.

7. Hero metrics may repeat within a screen.
   A screen may have one hero metric per section, provided only one
   section carries the largest size on the screen. Keep the rule: one
   dominant number per screen.

---

## Ring charts

Ring charts (also called donut charts or progress rings) are
permitted on a limited set of screens for a single-purpose metric:
"how close is the user to a goal?"

ALLOWED screens:
- Welcome (marketing preview)
- Home / Today (weekly frequency goal)
- Profile (monthly summary)
- Post-workout Summary (session completion, optional)

FORBIDDEN on:
- Progress
- Exercise Detail
- Session Detail
- Active Workout
- History
- Any analytics screen where precise comparison is the point

A ring chart must follow these rules:

1. One ring per section. Never stack 2+ rings in the same visual
   group unless explicitly designed together.
2. The ring is ALWAYS accompanied by a number — either centered
   inside the ring or placed directly beside it. The ring never
   replaces the number.
3. Track stroke: colors.surface (#F5F5F5).
   Fill stroke: colors.primary (#111111) OR colors.accent
   (#3B82F6) when the ring represents a live/active state.
   Never use success (#10B981) or error (#EF4444) as a ring fill.
4. Stroke width: 4px on hero rings (>= 80px diameter), 3px on
   smaller rings (<= 60px diameter).
5. Stroke caps: round.
6. Start angle: 12 o'clock (top). Direction: clockwise.
7. The empty portion of the track must remain visible — never fill
   the ring completely, even at 100%. Cap the visual fill at 96%
   so the track is always perceptible.
8. No gradient on the ring stroke. No shadow on the ring.
9. Do not use a multi-segment donut (pie chart with slices).
   Rings show a single ratio only.
10. Do not animate the ring unless the design specifically calls
    for an entrance animation.

---

## Testing

- Every `domain/rules/*.ts` has a `__tests__/*.test.ts`.
- Component tests use React Native Testing Library.
- Native modules without a JS fallback (MMKV, Google Sign-In) have Jest
  stand-ins in the root `__mocks__/`. A test's own `jest.mock` wins.
- New feature requires at least one integration test for the main flow.
- Test names: `describe('functionName')` + `it('does X')`.
- `npm test` runs in `America/New_York` (pinned by `jest.globalSetup.js`)
  so date code is tested west of UTC and across daylight saving. Build
  expected dates with local constructors (`new Date(2024, 0, 1)`), never
  `Date.UTC`.
- `npm run test:rules` runs `firestore/rules.emulator.ts` against the
  Firestore emulator. Requires Java 21.
- Before reporting work as done, run `npm run typecheck`, `npm run lint`
  and `npm test`. Lint uses `eslint-config-expo`; tests may declare
  `jest.mock` before imports (see `eslint.config.js`).

---

## File creation order (new feature)

1. `features/X/types.ts`
2. `features/X/services/XApi.ts`
3. `features/X/store/XStore.ts` (only if client state is needed)
4. `features/X/hooks/`
5. `features/X/components/`
6. `features/X/screens/`
7. `features/X/__tests__/`

Never create a screen before its types, service, and hook exist.

---

## Prohibitions

- No hard-coded colors or spacings. Use `@theme` tokens, EXCEPT for the two
  third-party sign-in brand marks (Google "G", Apple logo) in
  `src/features/auth/components/AuthIcons.tsx`. Those are brand assets and
  must keep their official colors. They are the only legal exception. All
  other colors come from @theme.
- No `any` type.
- No `AsyncStorage`. MMKV only. The single exception is Firebase Auth's own
  session persistence in `src/services/firebase/config.ts`
  (`getReactNativePersistence`).
- No `useEffect` for data fetching.
- No new state libraries (Redux, MobX, Jotai, Recoil).
- No new navigation libraries (Expo Router, Wouter).
- No new UI libraries (React Native Paper, NativeBase, Tamagui).
- No screen file over 200 lines of JSX.
- No two primary buttons on one screen.
- No KPI card grids or heatmaps on any screen.
- Donut and ring charts are allowed ONLY as specified in the
  "Ring charts" section above. Follow those rules exactly.
- No shadows, gradients, or blur anywhere.
- No `console.log` in committed code.
- No touching `/src/_legacy/` — it exists only for reference.

---

## Current project status

- **Auth**: implemented in `src/features/auth/` (email/password, Google,
  Apple). `src/services/firebase/config.ts` initializes Firebase and is
  the only file left under `src/services/`.
- **Onboarding, Workout, Routines, Analytics, History, Profile**:
  implemented under `src/features/`.
- **Backend**: Firebase Auth + Firestore. Workouts, the profile and
  preferences sync to Firestore (see "Sync"). Routines are local-only.
- **Design reference**: `/DESIGN.md`. There are no per-screen spec files.
- **Not released yet.** Data migrations may assume development installs.

---

## When to read which file

| Task                       | Read                                 |
| -------------------------- | ------------------------------------ |
| Writing a new component    | `/src/components/AGENTS.md`          |
| Adding a calculation       | `/src/domain/AGENTS.md`              |
| Working on workout logging | `/src/features/workout/AGENTS.md`    |
| Working on analytics       | `/src/features/analytics/AGENTS.md`  |
| Working on auth            | `/src/features/auth/AGENTS.md`       |
| Working on onboarding      | `/src/features/onboarding/AGENTS.md` |
| Working on routines        | `/src/features/routines/AGENTS.md`   |
| Working on history         | `/src/features/history/AGENTS.md`    |
| Working on profile         | `/src/features/profile/AGENTS.md`    |

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

**Persisted store:**

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

Before reporting "tests passed" or "tsc clean", run the command
yourself in the current environment AND paste the actual output
(trimmed). Do not report a result you did not observe.

If a command cannot run in the current environment (missing
dependency, wrong node version, etc.), report it as FAILED, not as
PASSED-with-workaround. Never silently work around a broken
environment.
