---
name: Kinetic Precision
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f3'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1a1c1c'
  on-surface-variant: '#4c4546'
  inverse-surface: '#2f3131'
  inverse-on-surface: '#f1f1f1'
  outline: '#7e7576'
  outline-variant: '#cfc4c5'
  surface-tint: '#5e5e5e'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1b1b1b'
  on-primary-container: '#848484'
  inverse-primary: '#c6c6c6'
  secondary: '#085ac0'
  on-secondary: '#ffffff'
  secondary-container: '#5b94fd'
  on-secondary-container: '#002c66'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#1b1b1b'
  on-tertiary-container: '#848484'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2e2e2'
  primary-fixed-dim: '#c6c6c6'
  on-primary-fixed: '#1b1b1b'
  on-primary-fixed-variant: '#474747'
  secondary-fixed: '#d8e2ff'
  secondary-fixed-dim: '#adc6ff'
  on-secondary-fixed: '#001a42'
  on-secondary-fixed-variant: '#004395'
  tertiary-fixed: '#e2e2e2'
  tertiary-fixed-dim: '#c6c6c6'
  on-tertiary-fixed: '#1b1b1b'
  on-tertiary-fixed-variant: '#474747'
  background: '#f9f9f9'
  on-background: '#1a1c1c'
  surface-variant: '#e2e2e2'
typography:
  display:
    fontFamily: Space Grotesk
    letterSpacing: -0.02em to -0.035em
  body:
    fontFamily: Inter
  numeric:
    fontFamily: Inter
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 20px
  margin: 1rem
  space-xs: 4px
  space-sm: 8px
  space-md: 12px
  space-lg: 16px
  space-xl: 24px
---

## Visual identity

Technical Minimalism. Calm authority. Engineering precision.
The product feels like a premium analytics or productivity app —
not a bodybuilding app.

Never use: heavy shadows, neumorphism, glassmorphism, blur,
decorative gradients, neon colors, stock fitness photography,
muscular imagery, dumbbell illustrations, or Dribbble-style UI.

Prefer flat surfaces and 1px hairlines over elevation.
Use typography and whitespace to create hierarchy before adding
containers. Do not place every piece of information inside a card.
Exactly one dominant primary action per screen.

## Component rules

Buttons:
  Primary: #111111 fill, #FFFFFF label, 8px radius, 52px height,
    Inter 15px/600. Exactly one per screen. Never disabled —
    validation produces inline errors on submit.
  Secondary: #FFFFFF fill, 1px #E5E7EB border, #111111 label,
    8px radius, 52px height.

Inputs:
  #FFFFFF fill, 1px #E5E7EB border, 8px radius, 52px height.
  Label above, Inter 13px/500 #374151. Focus border → #111111,
  no glow ring.

Surfaces:
  EITHER #F5F5F5 fill with no border, OR #FFFFFF with 1px #E5E7EB
  border. Never both. Never nested. 12px radius. 16px padding.

Segmented control:
  Track #F5F5F5, 8px radius (NOT pill), 4px inner padding.
  Selected segment: #FFFFFF fill, 1px #E5E7EB border, 8px radius,
    Inter 13px/500 #111111.
  Inactive: no background, Inter 13px/500 #6B7280.

List rows:
  56px minimum. Hairline 1px #E5E7EB between rows only.
  No card wrapping the list. No per-row surface.

Navigation header:
  44px tall. Centered title Inter 16px/600 #111111.
  No shadow. No color change on scroll.

Bottom tab bar:
  1px #E5E7EB top hairline. #FFFFFF fill. No shadow. No blur.
  No rounded top corners. 56px + bottom safe-area.
  Four items: Today · Progress · History · Profile.
  Icons: monoline outline, 1.5px stroke, 22px, no fill.
    Today → house outline
    Progress → three vertical bars, outline only
    History → clock outline
    Profile → single person outline
  4px gap. Label Inter 11px/500.
  Active: icon + label both #111111.
  Inactive: icon + label both #6B7280.
  No background pill. No indicator bar. Color-only active state.

Charts:
  1.5px #111111 stroke for primary series.
  Horizontal 1px #E5E7EB gridlines only. No vertical gridlines.
  No area fill. No gradient. Axis labels Inter 11px/500 #6B7280.
  At most one #3B82F6 highlighted data point per chart.
  No chart container card — charts sit directly on white.

Statistics:
  Value Inter 22-28px/600 #111111, tabular-nums.
  Label Inter 11-12px/500 #6B7280, uppercase, 0.04-0.06em tracking.

Ring charts:
  Permitted on Welcome, Home / Today, Profile, and post-workout Summary
  only — never on Progress, Exercise Detail, Session Detail, Active
  Workout, History, or any screen where precise comparison is the point.
  One ring per section. A single ratio only — never a multi-segment
  donut. The ring NEVER replaces the number: it is always paired with
  a value centered inside it or placed directly beside it.
  Track stroke 1px-width #F5F5F5; fill #111111, or #3B82F6 only when
  the ring marks a live/active state. Never #10B981 or #EF4444.
  Stroke width 4px at >= 80px diameter, 3px at <= 60px. Round caps.
  Starts at 12 o'clock, runs clockwise. Cap the visual fill at 96% so
  the track is always perceptible. No gradient, no shadow, no
  animation unless the design calls for an entrance.
  Full spec: see /AGENTS.md → "Ring charts".

## Color discipline

#3B82F6 is never a background fill. Its per-screen cap and
priority order: see "Design enrichment v3" (up to five).

#10B981 and #EF4444 are state colors only — never decoration.
Never use #EF4444 for negative deltas in a training context.
Use #6B7280 instead — a dip can mean a deload, not a failure.

One documented exception to the token rule: the third-party sign-in
brand marks (Google "G", Apple logo) in
`src/features/auth/components/AuthIcons.tsx` keep their official
colors, because users identify those marks by color. They are the only
hard-coded colors allowed outside @theme. No other icon may do this.

## Design enrichment rules (v2)

Seven targeted relaxations so the app reads clearly on a 390px
screen. Everything else in this document stands. Full text:
`/AGENTS.md` → "Design enrichment rules (v2)".

- Section headers: Inter 12px / 600, uppercase, #6B7280, 0.06em.
- Accent (#3B82F6) may appear up to three times per screen, in
  priority order: live/active state, single data highlight, focus or
  selection border. Never a fill.
- Flat cards allowed for grouping: #FFFFFF fill, 1px #E5E7EB border,
  12px radius, 16px padding, no shadow, never nested, 2–3 maximum.
- One soft #F5F5F5 block per screen may group same-type rows: 12px
  radius, 16px padding, no border, never nested.
- Monoline 1.5px icons encouraged where they add meaning: list-row
  categories, section headers, empty states. No icon without a job.
- One subtle shadow exception: `0 1px 2px rgba(0,0,0,0.04)` on the
  pinned bottom CTA bar over scrollable content and on bottom sheets.
  Nowhere else.
- One hero metric per section allowed; only one section may carry the
  largest size. Keep one dominant number per screen.

## Design enrichment v3 — fitness surface

Moves the UI from "documentation-clean" to "premium fitness analytics".
v1 and v2 stand except for the limits named here. Full text and
precedence: `/AGENTS.md` → "Design enrichment v3 — fitness surface".

- Cards are the default grouping unit: #FFFFFF fill, 1px #E5E7EB
  border, 12px radius, 16px padding, no shadow. No per-screen cap. Never
  nested, never inside a soft block.
- Metric wells: up to 3 #F5F5F5 regions per screen (12px radius, no
  border, 16px padding), each a distinct group of small metrics. Never
  inside a card, never a page background.
- Shadow `0 1px 2px rgba(0,0,0,0.04)` also allowed on bottom sheets,
  popovers, dropdowns, and anything floating above scrolling content.
  Never on inline cards.
- Accent (#3B82F6) up to five times per screen: live state, selection,
  data highlight, badge on a data point, progress fill. Never a fill.
- #10B981 for positive deltas, completed sets, PR badges, achieved
  states. #EF4444 for destructive, error and failed states. #F59E0B
  (`colors.warning`) for "close to limit", once per screen. Never large
  fills. A negative training delta is still #6B7280.
- Icons expected in section headers (16px), list rows (20px), metric
  labels (16px), empty states (32px). Monoline 1.5px, muted or primary,
  never filled, duotone or emoji — and never repeating the label.
- A hero metric may add ONE decoration: 30px sparkline, a 60–88px ring
  (ring-permitted screens only), or an 80px 10%-opacity watermark icon.
- Section headers may add a 16px glyph 6px before the label OR a
  hairline rule to the right edge (no right action). Never both.
- Exercise blocks on Active Workout, Session Detail and Exercise Detail
  are cards; set rows keep their internal hairlines.
- History, exercise picker and routine rows may lead with a 40px #F5F5F5
  rounded square (8px radius) holding the muscle icon or first letter.

Still in force over v3: the ring-chart rules, charts without a card of
their own, Profile without cards, plain History rows, the onboarding
rules, one primary action and one dominant number per screen.

## Settings components

Section header:
  Not a card. A plain label above a group of rows.
  Inter 11px / 500 #6B7280, 0.06em tracking, uppercase.
  24px above the header, 8px below.
  No background. No border. Left-aligned to the gutter.

Settings row:
  Height 52px minimum.
  1px #E5E7EB hairline between rows only — never above the first
  row of a section, never below the last row of a section.
  No per-row surface. No row shadow. No cards wrapping sections.
  Left: label — Inter 15px / 400 #111111.
  Right: EXACTLY one of the following, never two:
    - chevron glyph 16px #6B7280 (row navigates to a sub-screen)
    - value text — Inter 14px / 400 #6B7280, optionally followed
      by a chevron (row shows a current setting)
    - toggle switch (row flips a boolean)

Toggle switch:
  Track 44x24px, pill radius.
  Off: track #E5E7EB, knob #FFFFFF 20px circle.
  On:  track #111111, knob #FFFFFF 20px circle.
  No shadow on the knob. No border on the track.
  Transitions in 150ms ease-out, color only.

Destructive row:
  Label in #EF4444 instead of #111111.
  Same height, same hairline treatment, chevron stays #6B7280.
  No background tint. No red icon. No confirmation modal inside
  the row itself.
  Used only for irreversible actions (delete account, clear data).

Profile identity block:
  Avatar: 56px circle. #F5F5F5 fill. 1px #E5E7EB border.
    Initials inside — Inter 18px / 600 #111111.
    No photo. No gradient. No shadow. No online dot.
  Name: Inter 16px / 600 #111111.
  Email: Inter 13px / 400 #6B7280.
  12px gap between avatar and text column.
  2px gap between name and email.
  No card around the block. Sits directly on white.
  The whole block is a single tap target (opens Edit profile).