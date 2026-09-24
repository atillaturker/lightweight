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

## Color discipline

#3B82F6 appears at most twice per screen and only to mark
a selection, a live state, or a single data point.
Never as a background fill.

#10B981 and #EF4444 are state colors only — never decoration.
Never use #EF4444 for negative deltas in a training context.
Use #6B7280 instead — a dip can mean a deload, not a failure.

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