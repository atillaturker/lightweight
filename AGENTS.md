# AGENTS.md — Kinetic Strength Analytics

Mobile strength-training analytics app built with React Native (Expo).
Users log workouts; the app turns training history into progression
analytics, PRs, and strength curves. Feature-based architecture with a
pure domain layer, hand-built UI against a strict design system, and a
local-first persistence strategy.

---

## Tech stack

- Expo (managed workflow, SDK 51+)
- TypeScript (strict mode, `moduleResolution: bundler`)
- Zustand (client state) + TanStack Query (server state)
- React Navigation 8 (native-stack + bottom-tabs)
- react-native-mmkv (fast KV persistence)
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
Never import upward or sideways between features.

---

## Pre-code checklist

Before writing any code:

1. Does a type for this already exist in `@domain/entities/`?
   Reuse it. Never redefine.
2. Are you using tokens from `@theme`?
   Hard-coded colors and spacings are FORBIDDEN.
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
- Named exports everywhere. Default exports only for screens.
- File names: PascalCase for components, camelCase for utils and hooks.
- Import order: external → `@domain` → `@theme` → local. Blank line between groups.
- Comments in English.

---

## State management

| Kind           | Tool                   | Rule                                                                  |
| -------------- | ---------------------- | --------------------------------------------------------------------- |
| Server data    | TanStack Query         | Cache keys: `['sessions']`, `['progress', range]`, `['exercise', id]` |
| Client state   | Zustand                | `useShallow` MANDATORY on object selectors                            |
| Active workout | Zustand + MMKV persist | Writes on every set log. No "save" button.                            |
| Local UI       | `useState`             | Modals, inputs, transient state                                       |

Mutating server data:

1. Optimistic update via `queryClient.setQueryData`.
2. Fire the mutation.
3. On success: `invalidateQueries` for related keys.
4. On failure: rollback and surface an inline error.

Never use `useEffect` for data fetching.

---

## Navigation

Root (conditional)
├── Auth (stack)
├── Onboarding (stack, 5 screens)
└── Main (tabs, 4 items)
├── TodayTab (stack: Home → ActiveWorkout → Summary)
├── ProgressTab (stack: Progress → ExerciseDetail)
├── HistoryTab (stack: History → SessionDetail → ExerciseDetail)
└── ProfileTab (stack: Profile → Routines → RoutineEditor → ExercisePicker)

- Root switches on `authStatus` and `hasOnboarded`.
- Push screens use `navigation.replace` to avoid stack growth.
- Tab bar is custom: `src/components/TabBar/`. Do NOT use the default
  React Navigation tab bar.
- Tab icons: inline `react-native-svg`. `@expo/vector-icons` is FORBIDDEN.
- Always declare `ParamList` per stack and use `NativeStackScreenProps`.

---

## Design system summary

Full reference: `/DESIGN.md`.

- Canvas `#FFFFFF`, primary `#111111`, accent `#3B82F6`.
  Accent appears at most twice per screen and only to mark a selection,
  a live state, or a single data point. Never as a fill.
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

## Testing

- Every `domain/rules/*.ts` has a `__tests__/*.test.ts`.
- Component tests use React Native Testing Library.
- New feature requires at least one integration test for the main flow.
- Test names: `describe('functionName')` + `it('does X')`.

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

- No hard-coded colors or spacings. Use `@theme` tokens.
- No `any` type.
- No `AsyncStorage`. MMKV only.
- No `useEffect` for data fetching.
- No new state libraries (Redux, MobX, Jotai, Recoil).
- No new navigation libraries (Expo Router, Wouter).
- No new UI libraries (React Native Paper, NativeBase, Tamagui).
- No screen file over 200 lines of JSX.
- No two primary buttons on one screen.
- No shadows, gradients, or blur anywhere.
- No `console.log` in committed code.
- No touching `/src/_legacy/` — it exists only for reference.
- No refactoring `/src/screens/auth/`, `/src/services/`, `/src/schemas/`,
  or `/src/hooks/` until the new auth feature is written.

---

## Current project status

- **Auth**: legacy Firebase implementation is working. Do not break it.
  New `features/auth/` will be written later, at which point legacy auth
  is removed.
- **Onboarding, Workout, Routines, Analytics, History, Profile**: screens
  are designed (see `/DESIGN.md` and `/docs/screens/`) but not implemented.
- **Backend**: Firebase Auth + Firestore. Workout data persists to
  Firestore via `src/services/firebase/workoutService.ts`.
- **Design reference**: all screen specs live in `/docs/screens/`.

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

**Domain util:**

````ts
// src/domain/rules/e1rm.ts

/**
 * Estimate 1RM using the Epley formula.
 * Single-rep sets return the raw weight.
 */


// src/features/workout/store/activeWorkoutStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from '@infrastructure/storage/mmkv';

interface ActiveWorkoutState {
  sessionId: string | null;
  startWorkout: (routineId: string) => void;
  discardWorkout: () => void;
}

export const useActiveWorkoutStore = create<ActiveWorkoutState>()(
  persist(
    (set) => ({
      sessionId: null,
      startWorkout: (routineId) => set({ sessionId: routineId }),
      discardWorkout: () => set({ sessionId: null }),
    }),
    { name: 'active-workout', storage: createJSONStorage(() => mmkvStorage) },
  ),
);
export function calculateE1RM(weightKg: number, reps: number): number {
  if (reps <= 0) throw new Error('reps must be positive');
  if (reps === 1) return weightKg;
  return weightKg * (1 + reps / 30);
}

// src/features/workout/screens/ActiveWorkoutScreen.tsx
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TodayStackParamList } from '@/app/navigation/types';

type Props = NativeStackScreenProps<TodayStackParamList, 'ActiveWorkout'>;

export function ActiveWorkoutScreen({ route, navigation }: Props) {
  const { routineId } = route.params;
  // ...
}


---

## 2. `/src/domain/AGENTS.md`

```markdown
# AGENTS.md — Domain layer

Pure TypeScript. No React, no React Native, no navigation, no state
libraries, no network, no I/O. Imported by every other layer.

## Files

- `entities/` — Exercise, Workout, Set, Routine, User
- `value-objects/` — Weight, Reps, Volume, E1RM
- `rules/` — volume, pr, streak, e1rm calculations

## Rules

- Every exported function has a JSDoc block.
- No imports from `features/`, `components/`, `infrastructure/`, or `theme/`.
- Errors: throw plain `Error` with a clear message. No custom error classes.
- Pure functions only. No side effects, no async, no I/O.
- Weight is always stored as `kg`. Unit conversion happens at the UI edge.

## Naming

- `calculateX()` for calculations
- `isX()` for predicates
- `toX()` for conversions
- PascalCase for types and interfaces

## Testing

Every rule file gets a matching `__tests__/x.test.ts`. Test names
describe behavior: `it('excludes warmup sets from volume')`.

## Do not

- Do not import anything from React or React Native.
- Do not import from `@theme` (colors are a UI concern).
- Do not use `Date.now()` inside a pure function — accept a `now: number`
  parameter when time matters.
- Do not throw on nullable data. Return `null` explicitly.
````

## Verification rule

Before reporting "tests passed" or "tsc clean", run the command
yourself in the current environment AND paste the actual output
(trimmed). Do not report a result you did not observe.

If a command cannot run in the current environment (missing
dependency, wrong node version, etc.), report it as FAILED, not as
PASSED-with-workaround. Never silently work around a broken
environment.
