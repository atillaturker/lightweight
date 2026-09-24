# Task 06 — Playground v2

Update /src/\_dev/Playground.tsx to include every UI primitive built
so far. Playground v1 was created earlier and currently renders 6
primitives: Button, Input, Badge, Toggle, SegmentedControl, TextTabs.

Read first:
/src/\_dev/Playground.tsx
/src/components/AGENTS.md
/src/theme/index.ts

Do NOT modify any file under /src/components/.
Do NOT modify /src/theme/.
Do NOT modify App.tsx.

## Add these sections to the existing Playground

Preserve all existing sections in their current order. Add new
sections AFTER the existing ones (Typgography stays last or second
to last; see ordering below).

The final section order in the Playground should be:

1. Button (existing)
2. Input (existing)
3. Badge (existing)
4. Toggle (existing)
5. SegmentedControl (existing)
6. TextTabs (existing)
7. TabBar (NEW)
8. ScreenHeader (NEW)
9. SectionHeader (NEW)
10. SettingsRow (NEW)
11. Pill (NEW)
12. Radio (NEW)
13. EmptyState (NEW)
14. Typography (existing, moved to end)

Use the same section header style that Playground v1 uses
(hand-rolled Inter SemiBold 16px, colors.textPrimary).

---

## TabBar section

Title: "TabBar"

Render one TabBar instance, wired to local state, fixed to the
bottom of the screen (position absolute, bottom 0, left 0, right 0).

items = [
{ key: 'today', label: 'Today', icon: 'today' },
{ key: 'progress', label: 'Progress', icon: 'progress' },
{ key: 'history', label: 'History', icon: 'history' },
{ key: 'profile', label: 'Profile', icon: 'profile' },
]
activeKey: local state, default 'today'
onSelect: setActiveKey

Add ~80px bottom padding to the Playground ScrollView so the TabBar
does not cover the last section when scrolled to the bottom.

---

## ScreenHeader section

Title: "ScreenHeader"

Render three instances stacked vertically, each separated by 24px,
each wrapped in a bordered demo container (1px colors.hairline,
colors.surface background) so their 44px height is visible:

1. title="History", showBack={false}, no rightAction
2. title="Bench Press", showBack={true}, no rightAction
3. title="Progress", showBack={true}, rightAction={<a small
   "Edit" text action>}

For the "Edit" text action, use a simple Pressable with
Inter Medium 13px, colors.textPrimary, no handler.

---

## SectionHeader section

Title: "SectionHeader"

Render three instances stacked vertically, each separated by 24px:

1. label="TRAINING"
2. label="DATA" + action={<a small "See all" text action>}
3. label="APP" + action={<a small "Sort" text action>}

For text actions, use a simple Pressable with Inter Medium 13px,
colors.textMuted, no handler.

---

## SettingsRow section

Title: "SettingsRow"

Render the following rows stacked vertically, separated by 1px
colors.hairline dividers, inside a wrapper View. Each row uses
local state where needed:

1. variant="value", label="Units", value="Kilograms"
2. variant="value", label="Week starts on", value="Monday"
3. variant="toggle", label="RPE field", toggleValue={state3}, onToggleChange={setState3}
4. variant="toggle", label="Notifications", toggleValue={state4}, onToggleChange={setState4}
5. variant="chevron", label="Export data"
6. variant="chevron", label="Import data"
7. variant="destructive", label="Delete all workouts"
8. variant="plain", label="Sign out", onPress={() => {}}

All toggles start false.

---

## Pill section

Title: "Pill"

Render a horizontal row (gap: spacing.sm) with five Pills. Local
state tracks the selected one:

labels: "All", "Chest", "Back", "Legs", "Arms"
default selected: "All"

---

## Radio section

Title: "Radio"

Render four Radio options stacked vertically, separated by 1px
colors.hairline dividers. Local state tracks selection:

labels: "Kilograms (kg)", "Pounds (lb)", "Stone (st)", "Custom"
default selected: "Kilograms (kg)"

Note: this is a demo showing the Radio in isolation. In real usage,
radios appear with a 22px indicator and 64px rows.

---

## EmptyState section

Title: "EmptyState"

Render two EmptyState instances stacked vertically, each separated
by 40px:

1. title="No sessions yet", message="Your history will appear here."
2. title="No data for this filter", message="Try clearing the
   filter to see more.", action={<a Button variant="text"
   label="Clear filter">}

For the action, use the existing Button component from
@components/Button.

---

## CONSTRAINTS

- Use path alias imports (@theme, @components).
- No default exports.
- No `any`.
- Use tokens from @theme only. No hard-coded colors, spacings, radii.
- All interactive demos use local useState.
- Do not add new dependencies.
- Do not use @expo/vector-icons.
- Keep the existing Playground sections intact. Only append new
  sections and move Typography to the end.
- Preserve the ScrollView contentContainerStyle padding logic;
  add 80px bottom padding for the fixed TabBar.

## DELIVERABLES

After updating Playground.tsx:

Files modified: 1 (or list if you split sections into sub-files)

Run: npx tsc --noEmit
Run: npx jest src/\_dev (if any tests exist) — if not, skip and note it.

Report in this format:

- Files modified: N
- tsc: <clean | error count>
- jest: <result or "no tests">
- Judgment calls: max 3 bullet points

Then stop.
