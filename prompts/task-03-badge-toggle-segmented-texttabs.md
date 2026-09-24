# Task 03 — Badge, Toggle, SegmentedControl, TextTabs

Create four shared UI primitives. Read /AGENTS.md and
/src/components/AGENTS.md first. Follow every rule.

## Files to create

/src/components/Badge/
  - Badge.tsx
  - Badge.styles.ts
  - index.ts
  - Badge.test.tsx

/src/components/Toggle/
  - Toggle.tsx
  - Toggle.styles.ts
  - index.ts
  - Toggle.test.tsx

/src/components/SegmentedControl/
  - SegmentedControl.tsx
  - SegmentedControl.styles.ts
  - index.ts
  - SegmentedControl.test.tsx

/src/components/TextTabs/
  - TextTabs.tsx
  - TextTabs.styles.ts
  - index.ts
  - TextTabs.test.tsx

---

## BADGE

Props:
  - label: string
  - variant?: 'neutral' | 'pr'
  - testID?: string

Variants:
  neutral — background colors.surface (#F5F5F5), border 1px colors.hairline,
    text colors.textPrimary (#111111)
  pr — same as neutral. Do NOT use blue or green. The "PR" text
    itself is the only signal.

Spec:
  - Pill radius (radii.pill)
  - Height 20px
  - Horizontal padding spacing.sm (8)
  - Font: type.labelSmall (Inter Medium 11px, 0.06em tracking, uppercase)
  - Vertically centered text
  - No shadow, no icon, no dot, no number

---

## TOGGLE

Props:
  - value: boolean
  - onChange: (value: boolean) => void
  - disabled?: boolean
  - testID?: string

Spec:
  - Track: 44x24px, pill radius
  - Off state: track colors.hairline (#E5E7EB)
  - On state: track colors.primary (#111111)
  - Knob: 20px circle, colors.canvas (#FFFFFF), vertically centered
  - Knob shadow: NONE
  - Track border: NONE
  - Knob position: 2px inset from left (off) or right (on)
  - Animation: 150ms ease-out, position + color only
  - Use Animated API from react-native (or Reanimated if it is already
    in package.json — do not add new dependencies)
  - Tap target: 44px height minimum (extend hitSlop if needed)

Behavior:
  - Not a Switch component from react-native — build it with a Pressable
    wrapping an Animated.View. The native Switch looks different on iOS
    and Android and does not match the design.

---

## SEGMENTEDCONTROL

Props:
  - options: Array<{ value: string; label: string }>
  - value: string
  - onChange: (value: string) => void
  - testID?: string

Spec:
  - Track: full width, background colors.surface (#F5F5F5),
    border radius radii.control (8px). NOTE: 8px, NOT pill.
  - Track inner padding: spacing.xs (4)
  - Track height: 40px (32px + 8px padding)
  - Selected segment: background colors.canvas (#FFFFFF),
    border 1px colors.hairline (#E5E7EB), border radius radii.control (8)
  - Unselected segment: no background, no border
  - Selected text: type.label (Inter Medium 13px), colors.textPrimary
  - Unselected text: type.label, colors.textMuted (#6B7280)
  - All segments equal width (flex: 1), text centered
  - No shadow, no indicator bar, no animation beyond a color fade

Use case: time range selector (4W / 12W / 6M / 1Y)

---

## TEXTTABS

Props:
  - options: Array<{ value: string; label: string }>
  - value: string
  - onChange: (value: string) => void
  - scrollable?: boolean
  - testID?: string

Spec:
  - Horizontal row of text-only tabs. NO pills, NO backgrounds,
    NO borders.
  - Active tab: Inter Medium 13px / weight 600, colors.textPrimary,
    with a 2px colors.primary (#111111) underline below the text.
    Underline width matches the text width. Underline sits 6px
    below the baseline.
  - Inactive tab: Inter Medium 13px / weight 500,
    colors.textMuted (#6B7280). No underline.
  - Gap between tabs: spacing.xxl (24)
  - Row height: 32px total
  - If scrollable is true, use a horizontal ScrollView with
    showsHorizontalScrollIndicator={false}. Full-bleed is handled
    by the parent, not this component.

Use case: metric selector (1RM / Volume / Reps), or (Volume / Sets /
Reps / Time / Sessions)

---

## TESTS

Use @testing-library/react-native. Behavior only, not styling.

Badge.test.tsx:
  - renders the label
  - renders with the neutral variant by default

Toggle.test.tsx:
  - calls onChange with the flipped value when pressed
  - does not call onChange when disabled

SegmentedControl.test.tsx:
  - renders all option labels
  - calls onChange with the correct value when a segment is pressed
  - does not call onChange when the already-selected value is pressed

TextTabs.test.tsx:
  - renders all option labels
  - calls onChange with the correct value when a tab is pressed

---

## CONSTRAINTS

- Use path alias imports (@theme, @components). Never relative paths
  across folders.
- No default exports.
- No `any`.
- Every exported component has a JSDoc block.
- Do not introduce new colors, spacings, radii, or font sizes not in @theme.
- Do not add shadows, gradients, or blur.
- Use Pressable from react-native, not TouchableOpacity.
- Do not add new dependencies. If Reanimated is not in package.json,
  use the Animated API built into react-native.

---

## DELIVERABLES

Create all 16 files. After creating them, output:

1. A summary table: | File | Lines | Purpose |
2. Test results: run `npx jest src/components/Badge src/components/Toggle
   src/components/SegmentedControl src/components/TextTabs` and report
   pass/fail counts.
3. TypeScript check: run `npx tsc --noEmit` and report if clean.
4. Self-review: any judgment calls or deviations from the spec.

Then stop. Do not touch any other files.