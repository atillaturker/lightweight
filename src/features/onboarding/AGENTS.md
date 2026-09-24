# AGENTS.md — Onboarding feature

First-run experience. Five screens, split into two groups.

## Flow

1. Intro group (2 screens, skippable)

2. "Log every set." — product fragment: set table

3. "See your progress." — product fragment: line chart

4. Setup group (3 screens, required)

5. Units (kg / lb)

6. Weekly frequency target

7. First routine template

After step 5 the user lands on Main → TodayTab with `hasOnboarded: true`.

## Rules

- Intro screens have a "Skip" text action top-right that jumps directly
  to the Setup group.
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
  a card.
- No illustration, no photography, no mascot.
- Blue (`#3B82F6`) appears at most once, only on the second intro
  screen's chart as the latest data point.

## Do not

- Do not add a fifth setup step.
- Do not add a "tour" overlay after onboarding completes.
- Do not ask for the user's name, birthday, or gender.
- Do not make any setup step skippable except the intro group.
