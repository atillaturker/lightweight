# DESIGN.md — Kinetic

The design system for Kinetic Strength Analytics. This is the single
design reference: there are no per-screen spec files and no layered
"enrichment" addenda. Feature `AGENTS.md` files may add screen-specific
rules on top of this document; they never contradict it.

Token values live in `src/theme/`. This document names tokens by their
code name (`colors.accent`, `spacing.lg`, `type.metricHero`). Hex values
appear only in the token tables below.

---

## 1. Principles

Kinetic is a fitness app for people who train with intent. It should feel
like a precise instrument: calm, confident, dense with useful data, never
loud. The training data is the hero; the interface stays out of its way.

1. **Data first.** Every screen answers a training question (what do I do
   today, am I getting stronger, what did I do last time). Visual weight
   goes to the answer.
2. **Hierarchy from type and space before containers.** Reach for size,
   weight and whitespace first; add a card or well when grouping still
   needs help.
3. **Every mark has a job.** Color, icons, badges and decoration must
   carry meaning the text does not already carry. If removing it loses
   nothing, remove it.
4. **One primary action and one dominant number per screen.**
5. **Training is not pass/fail.** A dip can be a deload. Negative training
   deltas are neutral (`colors.textMuted`), never error-red.
6. **Both themes are first-class.** Every screen is designed and checked
   in light and dark.

Never: gradients, blur, glassmorphism, neumorphism, neon, colored or
diffuse shadows, emoji as UI, stock fitness photography, muscular
"hero" imagery, mascots.

---

## 2. Themes

The app ships a **light** and a **dark** theme. The user picks
`System` (default), `Light` or `Dark` in Profile → App → Appearance.
`System` follows the OS setting and switches live.

Every color is a semantic token with a value per theme. Code never asks
"is this dark mode?" to pick a color; it reads the token and the theme
supplies the value. The only legitimate scheme check is for third-party
assets that ship separate light/dark variants (e.g. the Apple sign-in
mark).

**Status:** the dark palette is specified here; theme switching is not
wired yet. See `AGENTS.md` → "Theming" for the migration.

---

## 3. Color tokens

| Token              | Role                                                  | Light       | Dark        |
| ------------------ | ----------------------------------------------------- | ----------- | ----------- |
| `canvas`           | Page background                                       | `#FFFFFF`   | `#0A0A0A`   |
| `canvasRaised`     | Floating surfaces: sheets, popovers, menus            | `#FFFFFF`   | `#161616`   |
| `surface`          | Wells, tiles, tracks, inactive fills                  | `#F5F5F5`   | `#1A1A1A`   |
| `hairline`         | 1px borders and dividers                              | `#E5E7EB`   | `#2A2A2A`   |
| `primary`          | Primary button fill, active controls, primary series  | `#111111`   | `#F5F5F5`   |
| `primaryHover`     | Pressed state of `primary`                            | `#262626`   | `#D4D4D4`   |
| `onPrimary`        | Text/icon on a `primary` fill                         | `#FFFFFF`   | `#111111`   |
| `accent`           | Meaningful highlight (see 4.1)                        | `#3B82F6`   | `#60A5FA`   |
| `controlSelected`  | Selected segment in a segmented control               | `#FFFFFF`   | `#2E2E2E`   |
| `trackOff`         | Toggle track when off; empty progress bars            | `#E5E7EB`   | `#3A3A3A`   |
| `textPrimary`      | Titles, values, row labels                            | `#111111`   | `#F5F5F5`   |
| `textBody`         | Paragraphs, input labels                              | `#374151`   | `#D1D5DB`   |
| `textMuted`        | Secondary labels, units, axis labels, neutral deltas  | `#6B7280`   | `#9CA3AF`   |
| `textDivider`      | Inline separators (`·`), disabled glyphs              | `#D1D5DB`   | `#4B5563`   |
| `success`          | Positive delta, completed set, PR, achieved           | `#10B981`   | `#34D399`   |
| `warning`          | Close to a limit (e.g. RPE 9–10)                      | `#F59E0B`   | `#FBBF24`   |
| `error`            | Destructive actions, errors, failed states            | `#EF4444`   | `#F87171`   |
| `backdrop`         | Dim layer behind sheets                               | `rgba(0,0,0,0.25)` | `rgba(0,0,0,0.6)` |
| `shadow`           | The one shadow color (see 7)                          | `rgba(0,0,0,0.04)` | transparent |

`textInverse` is renamed `onPrimary`: on dark the primary fill is light,
so "inverse of the page" is no longer white. Chart tokens are in
section 5.

Dark is not inverted light. It uses near-black (`#0A0A0A`), not pure
black, so hairlines and wells stay visible; text is off-white
(`#F5F5F5`) to avoid halation; state colors step one shade lighter to
keep 4.5:1 contrast.

---

## 4. Color usage

### 4.1 Accent

`colors.accent` marks something the user should notice because it means
something. Its roles, in priority order:

1. Live or active state (active routine, running session, rest timer).
2. Interactive selection (selected chip, active filter).
3. Highlighted data (latest chart point, current series, best lift).
4. Progress fill (ring, bar) when it represents a live or active goal.

Accent is never a large background fill and never decoration. There is
no fixed per-screen count, but if a screen has more than about five
accent marks, some of them are not meaningful — remove those.

### 4.2 Semantic colors

- `success`: positive deltas, completed sets, PR badges, achieved goals.
- `warning`: "close to limit" states. At most one per screen.
- `error`: destructive actions, error text and borders, failed states.
- A negative **training** delta is `textMuted`, not `error`.
- Semantic colors are for text, icons, strokes and small marks (dots,
  badges, thin bars). Never a large region fill.

### 4.3 Brand marks

The Google "G" and Apple marks in
`src/features/auth/components/AuthIcons.tsx` keep their official colors
(Apple: black on light, white on dark). They are the only colors defined
outside `@theme`.

---

## 5. Data visualization

### 5.1 Chart tokens

| Token               | Role                                      | Light     | Dark      |
| ------------------- | ----------------------------------------- | --------- | --------- |
| `chartLine`         | Primary series                            | `#111111` | `#F5F5F5` |
| `chartSeries2`      | Comparison series (previous period, etc.) | `#9CA3AF` | `#6B7280` |
| `chartHighlight`    | Highlighted point / current series        | `#3B82F6` | `#60A5FA` |
| `chartGrid`         | Gridlines, baseline                       | `#E5E7EB` | `#2A2A2A` |
| `chartBarCurrent`   | Current-period bars                       | `#111111` | `#F5F5F5` |
| `chartBarPrevious`  | Previous-period bars                      | `#E5E7EB` | `#2A2A2A` |

### 5.2 Intensity scale

For anything that shades cells or regions by amount: the activity
heatmap, the muscle map, effort histograms. Five steps, monochrome, from
"none" to "most". Accent is never part of the scale; it marks the
selected cell or region.

| Token          | Light     | Dark      |
| -------------- | --------- | --------- |
| `intensity0`   | `#F5F5F5` | `#1A1A1A` |
| `intensity1`   | `#D4D4D4` | `#333333` |
| `intensity2`   | `#A3A3A3` | `#575757` |
| `intensity3`   | `#525252` | `#A3A3A3` |
| `intensity4`   | `#111111` | `#F5F5F5` |

### 5.3 Chart rules

- Charts sit directly on the canvas, not inside a card of their own. A
  hero card may group a metric with its chart.
- Line: 1.5px stroke, round joins, no area fill. Points hidden except the
  highlighted one (6px `chartHighlight` circle).
- Gridlines horizontal only, 1px `chartGrid`, 2–3 y-axis labels.
- X-axis: three labels (start, middle, end) unless the axis is
  categorical (weekdays, muscles).
- Axis labels `type.caption`, `textMuted`, tabular numbers.
- Height: 180px in lists and overviews, up to 240px on a detail screen
  where the chart is the subject.
- Up to three series per chart: `chartLine`, `chartHighlight`,
  `chartSeries2`. Two or more series need a legend: a row of 8px
  rounded swatches + `type.caption` labels above the chart.
- Every chart has a time-range control when the range is meaningful
  (`SegmentedControl`: 4W · 3M · 1Y · All, or a subset).
- Every chart answers one question, stated in its section header
  ("Estimated 1RM", "Weekly hard sets").
- Tapping a point or cell shows its exact value inline, above the chart
  (scrub readout). No floating tooltip cards.

### 5.4 Chart types

| Type          | Use for                                         | Notes |
| ------------- | ----------------------------------------------- | ----- |
| Line          | A value over time (e1RM, top set, body weight)  | Goal lines: 1px dashed `textMuted` with a label. |
| Bar           | Totals per period (weekly volume, sets)         | 4–8px bars, 2px top radius; current vs previous via bar tokens. |
| Sparkline     | Trend decoration beside a hero metric           | 30px tall, 1.5px, no axes. |
| Ring          | Progress toward a goal (weekly frequency)       | See 5.5. Not for comparison. |
| Heatmap       | Activity over a calendar (year / month view)    | Square cells, 2px gap, 2px radius, intensity scale. |
| Muscle map    | Training load per muscle (front + back body)    | Monoline body outline; regions shaded with the intensity scale; selected region outlined in `accent`. Untrained regions listed in text below it. |
| Histogram     | Distribution (effort per set, reps per set)     | Bar rules; intensity scale permitted for buckets. |

Never: pie charts, multi-segment donuts, 3D charts, stacked areas,
radar/spider charts, dual y-axes.

### 5.5 Rings

- Shows a single ratio toward a goal. Always paired with the number
  (inside or beside it); the ring never replaces the number.
- Track `surface`; fill `primary`, or `accent` when the ring is live or
  active. Never a semantic color.
- Stroke 4px at ≥ 80px diameter, 3px at ≤ 60px. Round caps. Starts at
  12 o'clock, runs clockwise. Visual fill capped at 96% so the track
  stays visible.
- One ring per section. No animation unless the design calls for an
  entrance.
- Not used where precise comparison is the point (Exercise Detail,
  Session Detail, Active Workout set tables).

---

## 6. Typography

Two families: **Space Grotesk** SemiBold for display, **Inter** for
everything else. No other fonts. Every text uses a `type.*` token; no
ad-hoc `fontSize` or `fontWeight`.

| Token          | Family / size / line          | Use |
| -------------- | ----------------------------- | --- |
| `displayLarge` | Space Grotesk 34 / 38, −1.0   | Onboarding and welcome headlines |
| `display`      | Space Grotesk 28 / 34, −0.7   | Screen titles on top-level tabs |
| `headline`     | Space Grotesk 24 / 30, −0.6   | Detail-screen headings |
| `sectionTitle` | Inter SemiBold 16 / 20        | Card titles, exercise names |
| `metricHero`   | Inter SemiBold 44 / 48        | The screen's dominant number |
| `metricLarge`  | Inter SemiBold 24 / 28        | Section hero metrics |
| `metric`       | Inter SemiBold 20 / 24        | Stat strips |
| `bodyLarge`    | Inter 16 / 24                 | Lead paragraphs |
| `body`         | Inter 15 / 22                 | Default text, row labels |
| `bodySmall`    | Inter 13 / 18                 | Secondary text |
| `label`        | Inter Medium 13 / 18          | Input labels, control labels |
| `labelSmall`   | Inter Medium 11 / 14          | Tab bar labels, units |
| `caption`      | Inter 12 / 16                 | Axis labels, footnotes |
| `button`       | Inter SemiBold 15 / 20        | Buttons |
| `buttonSmall`  | Inter Medium 13 / 18          | Compact buttons, text actions |

- `fontVariant: ['tabular-nums']` on every number in a table, stat strip,
  chart axis, timer or set row.
- Section headers: Inter SemiBold 12px, uppercase, 0.06em tracking,
  `textMuted` (the `SectionHeader` component). A header may carry a
  16px glyph 6px before the label, OR a 1px `hairline` rule running to
  the right edge when it has no right action. Never both.
- Hero metrics: label + value + unit + optional delta. A screen may
  have one hero per section, but only one at `metricHero` size. A hero
  may add ONE decoration: a sparkline, a ring (5.5), or an 80px
  monoline watermark icon at 10% opacity, bottom-right.
- Copy is sentence case. Buttons are verbs ("Start workout", "Finish").

---

## 7. Layout, surfaces and elevation

### 7.1 Spacing and radii

- Spacing scale `spacing.*`: 4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 56.
  Screen gutter 20. `fineSpacing` holds four named off-scale values,
  each with one job; never use them for new layouts.
- Radii `radii.*`: `control` 8 (buttons, inputs, segmented controls,
  tiles), `card` 12 (cards, wells), `stage` 16 (sheets, large
  containers), `pill` (badges, chips, filters only).
- Touch targets ≥ 44×44.

### 7.2 Surfaces

| Surface   | Spec                                                         | Use |
| --------- | ------------------------------------------------------------ | --- |
| Canvas    | `canvas`                                                     | Page background |
| Card      | `canvas` fill, 1px `hairline`, `radii.card`, 16 padding      | Items that belong together: an exercise block, a metric + its chart, a short list group |
| Well      | `surface` fill, no border, `radii.card`, 16 padding          | A group of small metrics (stat strip, summary row) |
| Raised    | `canvasRaised` fill, `radii.stage` top corners               | Bottom sheets, popovers, menus |

- Never nest a card in a card, a card in a well, or a well in a card.
- Lists are rows with hairlines between them, not a card per row.
- Settings sections and the profile identity block sit on the canvas,
  never in a card.

### 7.3 Elevation

There is one shadow: `0 1px 2px colors.shadow`, allowed only on floating
elements (bottom sheets, popovers, menus, a pinned CTA bar over
scrolling content). On dark, `shadow` is transparent and the floating
element is separated by `canvasRaised` plus a 1px `hairline` top
border instead. Inline cards never get a shadow.

---

## 8. Iconography

- Monoline SVG, 1.5px stroke, round caps and joins, no fill, no duotone.
  Drawn with `react-native-svg` (`LineIcon`, `MuscleIcon`, `TabBar`).
  `@expo/vector-icons` is forbidden.
- Sizes: 16 (section headers, metric labels), 20 (list rows),
  22 (tab bar), 32 (empty states).
- Color `textPrimary` or `textMuted`; `accent` or a semantic color only
  when the icon itself carries that state.
- An icon must add meaning the text does not. A dumbbell before
  "Bench Press" is noise.
- List rows (history, routines, exercise picker) may lead with a 40px
  tile: `surface` fill, `radii.control`, holding a muscle icon, an
  exercise illustration or the first letter (`IconTile`).

---

## 9. Exercise media

Exercises are shown with **line illustrations**, consistent with the
icon language: monoline drawings of the start and end position, tinted
with `textPrimary` so they work in both themes.

- Formats: SVG preferred (tintable); PNG with transparency acceptable.
- Placement: 40px in list tiles, full-width (max 240px tall) on
  Exercise Detail, two frames side by side ("Start" / "End") or
  alternating at 1s for a two-frame animation.
- No photographs, no 3D-rendered or skin-toned figures, no video.
- Every media set has a recorded license. Third-party media is used only
  under a license that permits commercial redistribution in an app, and
  its attribution is shown on Profile → About → Acknowledgements.
- An exercise without media falls back to its muscle icon.

---

## 10. Components

### Buttons
- **Primary:** `primary` fill, `onPrimary` label, `radii.control`,
  52px tall, `type.button`. Exactly one per screen. Never disabled —
  validation shows inline errors on submit.
- **Secondary:** `canvas` fill, 1px `hairline`, `textPrimary` label,
  same size.
- **Text action:** `type.buttonSmall`, `textPrimary`, no container.
- **Destructive:** secondary style with an `error` label.

### Inputs
`canvas` fill, 1px `hairline`, `radii.control`, 52px tall. Label above
in `type.label` / `textBody`. Focus: border `primary`. Error: border and
helper text `error`. No glow.

### Segmented control
Track `surface`, `radii.control`, 4px inner padding. Selected segment
`controlSelected` fill, 1px `hairline`, `type.label` `textPrimary`.
Inactive: no fill, `textMuted`.

### Chips and filters
`radii.pill`, 32px tall. Inactive: 1px `hairline`, `textBody`.
Selected: 1px `accent` border, `accent` label. Never a filled chip.

### Badges
`radii.pill`, `surface` fill, 1px `hairline`, `type.labelSmall`.
The PR badge uses a `success` label and border.

### List rows
56px minimum, `body` label, optional `bodySmall` meta line. Hairline
between rows only. Right side: one of chevron, value, value + chevron,
or toggle.

### Toggle
44×24 track, `radii.pill`, 20px `onPrimary` knob. Off track
`trackOff`, on track `primary`. 150ms color transition, no knob
shadow.

### Navigation header
44px, centered `sectionTitle`, `textPrimary`. No shadow, no color
change on scroll.

### Tab bar
Custom (`src/components/TabBar/`). `canvas` fill, 1px `hairline` top
border, 56px + safe area. Four items: Today · Progress · History ·
Profile. 22px monoline icons, `labelSmall` labels, 4px gap. Active:
`textPrimary`; inactive: `textMuted`. No pill, no indicator bar.

### Bottom sheets
`canvasRaised`, `radii.stage` top corners, 36×4 `hairline` grabber,
`backdrop` behind. Elevation per 7.3.

### Empty states
32px monoline icon, one `sectionTitle` line, one `bodySmall` line, and
at most one action. Vertical padding `emptyStatePadding`.

---

## 11. Motion

Motion explains a change; it never decorates. 150–250ms, ease-out.
Allowed: sheet presentation, row insert/remove, value changes on a
counting timer, the PR badge appearing. No bouncing, no parallax, no
looping animation except an exercise's two-frame illustration and a
running timer. Respect the OS "Reduce Motion" setting.

---

## 12. Accessibility

- Text contrast ≥ 4.5:1 (≥ 3:1 for `metricHero` and display sizes) in
  both themes. The token tables above meet this; new tokens must too.
- Never encode meaning in color alone: deltas carry a sign (`+2.5 kg`),
  PRs carry a badge label, heatmap cells expose their value on tap.
- Every icon-only control has an `accessibilityLabel`.
- Layouts survive the OS's largest standard text size without clipping
  numbers in set rows and stat strips.
