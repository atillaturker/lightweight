# AGENTS.md — Onboarding feature

First-run experience. Three required setup screens, plus the welcome
screen and the two pre-auth intro screens this folder owns.

## Flow

Root navigator order: Welcome → Intro1 → Intro2 → Auth → Setup → Main.

**Welcome (pre-auth, first screen, not skippable)** —
`/src/features/onboarding/screens/WelcomeScreen.tsx`

Structure follows the Stitch "Welcome − Kinetic Strength Analytics"
screen: a left-aligned brand row (56px rounded-square mark + "Kinetic"
wordmark), a left-aligned copy block (overline "Strength analytics",
headline "Train with intention.", supporting line), the full-bleed
product-data preview carousel (four 8-week est. 1RM line charts), and one
pinned primary action.

Two actions: "Get started" continues into the intro group; "I already
have an account" marks both first-run flags and lets the root navigator
swap to AuthStack. No header, no back, no skip, no illustration. Marked
as seen by either action, so it appears at most once per install.

The carousel is the only product evidence on the screen and is strictly
monochrome — the accent color never appears on Welcome.

**Intro group (pre-auth, 2 screens, skippable)** — `/src/app/navigation/IntroStack.tsx`

1. "Log every set." — product fragment: set table
2. "See your progress." — product fragment: line chart

Both intros mark the app-level `hasSeenIntro` flag; the root navigator
then swaps to AuthStack. The intro is never shown again on that install,
including after a sign-out.

**Auth group** — `/src/app/navigation/AuthStack.tsx` (owned by `features/auth`).

Log-in first: `initialRouteName="LogIn"`. Sign-up is reached from the
account-switch row on the log-in screen.

**Setup group (post-auth, 3 screens, required)** — `/src/app/navigation/OnboardingStack.tsx`

1. Units (kg / lb)
2. Weekly frequency target
3. First routine template

After step 3 the user lands on Main → TodayTab with `hasOnboarded: true`.

On sign-out `hasSeenWelcome` and `hasSeenIntro` stay true, so a cold
start (and a sign-out) lands on AuthStack → LogIn, never on Welcome or
the intro.

The retired legacy Welcome no longer exists in the tree. If one is ever
reintroduced elsewhere it stays retired — this screen is the live one.

## Rules

- Welcome's entry point is `hasSeenWelcome`; `IntroStack` receives it as
  a prop and picks `initialRouteName`. The stack has three routes —
  Welcome, Intro1, Intro2 — and only the entry screen differs.
- Welcome's carousel lives in `components/WelcomeChartCarousel.tsx`
  (card: `WelcomeChartCard.tsx`, sample series: `welcomeChartSeries.ts`).
  Cards are flat on the canvas — no card surface, border or shadow — and
  the polyline uses only `chartLine` + `chartGrid`.
- Intro screens have a "Skip" text action top-right. On both intros
  "Skip" and the primary CTA call `markIntroSeen()`; nothing navigates to
  Auth by hand.
- Setup screens have a back chevron on steps 2 and 3, none on step 1.
- Progress indicator: three 24x3px bars, pill-radius, 4px gap.
  Only the CURRENT step's bar is `#111111`. Completed steps are NOT
  black — they return to `#E5E7EB`. Never use a colored dot.
- Option lists use radio rows, not cards. 64px row height.
  22px radio + label. Hairline between rows, inset 38px from the left.
- Setup step 3 (routines) has 76px rows because each option carries a
  description line.
- Setup step 3's CTA label is "Get started", not "Continue".

## Design constraints

- Intro screens are the only screens that show product fragments.
  Fragments sit directly on white, cut at the bottom edge, never inside
  a card. (Welcome's carousel cards are the deliberate exception: flat
  chart blocks, still no surface or border.)
- No illustration, no photography, no mascot.
- Blue (`#3B82F6`) appears at most once, only on the second intro
  screen's chart as the latest data point.

## Do not

- Do not add a fourth setup step.
- Do not add a "tour" overlay after onboarding completes.
- Do not ask for the user's name, birthday, or gender.
- Do not make any setup step skippable except the intro group.
- Do not navigate from an intro screen to Auth — flip `hasSeenIntro` and
  let the root navigator do the swap.
