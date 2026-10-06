# AGENTS.md — Profile feature

Account, settings, and preferences. Two screens.

## Screens

- `ProfileScreen` — identity block + settings sections.
- `SettingsScreen` (optional, if split) — advanced options.

## Rules

- Section headers: the shared `SectionHeader` (DESIGN.md §6).
  24px above the header, 8px below. No background, no border.
- Settings row: 52px minimum height. Hairline between rows only —
  never above the first row of a section, never below the last.
- Right side of a row has EXACTLY ONE of these, never two:
  chevron, value text (+ optional chevron), or a toggle switch.
- Toggle: the shared `Toggle` (DESIGN.md §10).
- Identity block: 56px avatar (initials only, no photo), name, email,
  chevron. Whole block is one tap target. No card wrapping it.
- Destructive rows use `colors.error` for the label only. No red icon,
  no background tint. Used only for "Delete all workouts".
- "Sign out" is NOT destructive. Label stays `colors.textPrimary`.
- There is NO primary CTA on this screen. Settings apply immediately.

## Sections

`TRAINING` — Units, Week starts on, RPE field (toggle), Rest timer.
`DATA` — Export data, Import data, Delete all workouts (destructive).
`APP` — Appearance (System / Light / Dark, opens a sheet),
Notifications (toggle), About (with version and Acknowledgements),
Sign out.

## Do not

- Do not wrap sections in cards.
- Do not add a profile photo picker.
- Do not add "Save" or "Done" in the header.
- Do not add badges, counters, or "New" tags next to rows.
- Do not add a version number as a footer.
- Do not put a primary CTA at the bottom.
