# Task — Developer Playground screen

Create a temporary developer playground screen that renders every UI
primitive built so far, so we can visually verify the design system
before wiring real screens.

Read /AGENTS.md, /src/components/AGENTS.md, and /src/theme/index.ts
first. Follow every rule.

This is a DEV-ONLY screen. It will be deleted before shipping.
Place it under /src/\_dev/ so the underscore prefix marks it as
non-production code.

## Files to create

/src/\_dev/Playground.tsx — the screen
/src/\_dev/index.ts — re-export

Then modify App.tsx to render <Playground /> instead of the current
placeholder. Leave a comment in App.tsx:

// TODO: replace with real navigation once features are wired up.

Do NOT touch any other files. Do NOT modify the primitives themselves.

## Playground structure

A single vertical ScrollView with the canvas background. Full content
gutter (gutter from @theme = 20px).

Add generous vertical padding at top and bottom (spacing.giant above,
spacing.giant below) so nothing is cut by the status bar or home
indicator.

For every section:

- A section title, using hand-rolled text styling:
  Inter SemiBold 16px, colors.textPrimary.
  Do NOT use SectionHeader — it does not exist yet.
- 16px below the title, the demo content.
- 40px below the section content, the next section begins.

The screen should read top to bottom, one primitive per section, in
the order listed below.

---

## Section 1 — Button

Title: "Button"

Render the following, each in its own row with 12px vertical gap:

1. variant="primary" label="Log set"
2. variant="secondary" label="Continue with Apple"
3. variant="text" label="I already have an account"
4. variant="primary" label="Saving…" loading={true}
5. variant="primary" label="Disabled" disabled={true}
6. variant="primary" label="Continue" fullWidth={true}
   (this one spans the full content width)
7. A primary button with a small icon on the left — use a 16px
   inline SVG of a plus sign, color matching the label color.

Row 6 is the only full-width instance. Rows 1-5 and 7 are natural width.

---

## Section 2 — Input

Title: "Input"

Render a controlled input demo. Each instance uses local state so the
field is interactive (do not render statically disabled inputs unless
the spec says so).

1. Input with label="Email", placeholder="you@example.com"
2. Input with label="Password", secureTextEntry, and a
   rightAccessory that toggles visibility. Use a simple text glyph
   "👁" as a placeholder for the eye icon — do not import an icon
   library. rightAccessory Pressable calls a local state setter.
3. Input with label="Email", value containing an invalid email,
   error="Enter a valid email address."
4. Input with label="Password", helperText="At least 8 characters."

Vertical gap between inputs: 24px.

All inputs are controlled with local useState. The user can type into
them.

---

## Section 3 — Badge

Title: "Badge"

Render a horizontal row (flexDirection: 'row', gap: spacing.sm) with:

1. <Badge label="PR" />
2. <Badge label="PR" variant="pr" />

Both should look identical — the variant is a signal, not a color.

---

## Section 4 — Toggle

Title: "Toggle"

Render three rows, each with a label on the left and a Toggle on the
right. Labels use Inter Regular 15px, colors.textPrimary.

1. "RPE field" — Toggle value={false}
2. "Notifications" — Toggle value={true}
3. "Auto rest" — Toggle value={false} disabled

Each Toggle is interactive (stateful via useState), except the third
which is disabled and non-interactive.

Row layout: flexDirection row, justifyContent space-between,
alignItems center, 52px min height, hairline between rows.

---

## Section 5 — SegmentedControl

Title: "SegmentedControl"

Render two instances:

1. Range selector demo:
   options: [4W, 12W, 6M, 1Y], value="12W"
2. Binary demo:
   options: [Upper, Lower], value="Upper"

State: each has its own useState so tapping changes the selection.

Vertical gap between the two: 24px.

Full width for both.

---

## Section 6 — TextTabs

Title: "TextTabs"

Render two instances:

1. Non-scrollable:
   options: [1RM, Volume, Reps], value="1RM"
   scrollable={false}

2. Scrollable (horizontal):
   options: [Volume, Sets, Reps, Time, Sessions], value="Volume"
   scrollable={true}

State: each has its own useState.

Vertical gap between: 32px.

---

## Section 7 — Typography reference

Title: "Typography"

For reference only — render each entry from @theme `type` object as a
row. Each row shows the token name in Inter Medium 11px
colors.textMuted above the styled text sample. Token names shown:

displayLarge, display, headline, sectionTitle,
metricHero, metricLarge, metric,
bodyLarge, body, bodySmall,
label, labelSmall, caption,
button, buttonSmall

Sample text for all: "The quick brown fox 0123456789".

Vertical gap between rows: 12px.

This section is intentionally verbose — it exists so we can verify
every type token looks right on a real device.

---

## Colors

No hard-coded hex values anywhere. Import from @theme.

## Constraints

- Path alias imports (@theme, @components).
- No default exports.
- No `any`.
- No new dependencies.
- Do not use @expo/vector-icons or any icon library.
- ScrollView contentContainerStyle for padding — not a wrapping View.
- All interactive demos use local useState; do not use Zustand or
  TanStack Query.
- Do not use navigation — the Playground is a top-level screen
  rendered directly by App.tsx.

## Do not

- Do not modify any file under /src/components/.
- Do not modify /src/theme/.
- Do not create additional screens or navigation.
- Do not add a header, tab bar, or safe-area logic beyond what
  SafeAreaProvider already provides in App.tsx.
- Do not remove the placeholder text in App.tsx without leaving the
  TODO comment.
- Do not touch /src/\_legacy/.

## Deliverables

Create the two files, modify App.tsx, then output:

1. Summary table: | File | Lines | Purpose |
2. `npx tsc --noEmit` result
3. Confirmation that App.tsx now renders <Playground />
4. Any judgment calls

Then stop.
