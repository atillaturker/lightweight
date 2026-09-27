# AGENTS.md — Domain layer

Pure TypeScript. No React, no React Native, no navigation, no state
libraries, no network, no I/O. Imported by every other layer.

## Files

- `entities/` — Exercise, Workout, Set, Routine, User
- `value-objects/` — Weight, Volume, E1RM
- `rules/` — volume, pr, streak, e1rm, delta calculations

## Rules

- Every exported function has a JSDoc block.
- No imports from `features/`, `components/`, `infrastructure/`, or `theme/`.
- Errors: throw plain `Error` with a clear message. No custom error classes.
- Pure functions only. No side effects, no async, no I/O.
- Weight is always stored as `kg`. Unit conversion happens at the UI edge.
- A working set is completed, not a warmup, and has at least one rep
  (`isWorkingSet`). Every volume, PR, e1RM and streak rule relies on it.

## Dates

- Weeks follow the device's local calendar: `startOfWeek` returns local
  midnight on the configured first day.
- Never step weeks with a fixed `7 * 24h`. Use `addWeeks` and
  `weeksBetween`; a week that crosses a daylight-saving change is 167 or
  169 hours long.

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
