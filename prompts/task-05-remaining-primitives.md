# Task 05 — SectionHeader, SettingsRow, Pill, Radio, EmptyState

Create five final shared UI primitives. After this task, all UI
primitives are in place and the domain layer can be built.

Read first:
/AGENTS.md
/src/components/AGENTS.md
/src/theme/index.ts

---

## File structure

/src/components/SectionHeader/ (SectionHeader.tsx, .styles.ts, index.ts, .test.tsx)
/src/components/SettingsRow/ (SettingsRow.tsx, .styles.ts, index.ts, .test.tsx)
/src/components/Pill/ (Pill.tsx, .styles.ts, index.ts, .test.tsx)
/src/components/Radio/ (Radio.tsx, .styles.ts, index.ts, .test.tsx)
/src/components/EmptyState/ (EmptyState.tsx, .styles.ts, index.ts, .test.tsx)

---

## SECTIONHEADER

Props:
interface SectionHeaderProps {
label: string;
action?: React.ReactNode;
testID?: string;
}

Spec:

- Full content width, left-aligned label
- Label: Inter Medium 11px, colors.textMuted (#6B7280),
  uppercase, 0.06em tracking
- If action provided: right-aligned in the same row.
  Typically a "See all" text action (Inter Medium 13px,
  colors.textMuted) or a "Sort" action. The caller passes
  the node; this component does not style it.
- Vertical padding: none inside the component — the parent
  manages spacing above and below.
- No background, no border, no card.

Row layout: flexDirection row, alignItems center,
justifyContent space-between.

---

## SETTINGSROW

Props:
interface SettingsRowProps {
label: string;
variant?: 'chevron' | 'value' | 'toggle' | 'destructive' | 'plain';
value?: string;
toggleValue?: boolean;
onToggleChange?: (value: boolean) => void;
onPress?: () => void;
testID?: string;
}

Spec:

- Height: 52px minimum
- Full content width
- Left: label — Inter Regular 15px, colors.textPrimary.
  If variant === 'destructive', label color is colors.error
  (#EF4444).
- Right side (exactly one of these, never two):
  variant 'chevron' → 16px chevron glyph, colors.textMuted
  variant 'value' → value text (Inter Regular 14px,
  colors.textMuted) + chevron
  variant 'toggle' → <Toggle /> component (imported from
  @components/Toggle), controlled by
  toggleValue and onToggleChange
  variant 'destructive' → chevron glyph (same as 'chevron')
  variant 'plain' → nothing (label + tap target only)
- No background, no border, no card.
- The 1px hairline between rows is managed by the parent — this
  component does not render its own hairline.
- If onPress is provided, wrap the row in a Pressable with 44px
  minimum tap target.

---

## PILL

Props:
interface PillProps {
label: string;
selected?: boolean;
onPress?: () => void;
testID?: string;
}

Spec:

- Height: 32px, horizontal padding spacing.md (12)
- Pill radius (radii.pill)
- Selected: background colors.primary (#111111), no border,
  label Inter Medium 13px, colors.textInverse
- Unselected: background colors.canvas (#FFFFFF),
  border 1px colors.hairline,
  label Inter Medium 13px, colors.textPrimary
- No shadow, no icon.
- If onPress is provided, wrap in Pressable.

Use case: filter chips (All / Chest / Back / Legs / ...)

Note: this is distinct from SegmentedControl (which sits inside a
track) and from Badge (which is non-interactive). A Pill is a
standalone tappable filter chip.

---

## RADIO

Props:
interface RadioProps {
selected: boolean;
label?: string;
onPress?: () => void;
disabled?: boolean;
testID?: string;
}

Spec:

- Radio indicator: 22px diameter
- Selected: filled colors.primary (#111111) circle with a 10px
  colors.canvas (#FFFFFF) check glyph centered inside
- Unselected: 1px colors.hairline border, colors.canvas fill,
  no glyph
- If label is provided: 16px gap between radio and label;
  label Inter Regular 15px, colors.textPrimary.
- If onPress is provided, wrap the whole row in a Pressable with
  44px minimum tap target.
- Row layout: flexDirection row, alignItems center.

Draw the check glyph as an inline SVG (react-native-svg) with path:
<Path d="M20 6L9 17l-5-5" />
stroke=colors.canvas, strokeWidth=2, fill=none,
strokeLinecap="round", strokeLinejoin="round",
viewBox="0 0 24 24", width=10, height=10.

---

## EMPTYSTATE

Props:
interface EmptyStateProps {
title: string;
message?: string;
action?: React.ReactNode;
testID?: string;
}

Spec:

- Centered container, horizontal padding gutter (20)
- Title: Inter SemiBold 16px, colors.textPrimary, text-align center
- Message (if provided): 8px below the title,
  Inter Regular 14px, colors.textMuted, text-align center
- Action (if provided): 24px below the message, centered.
  The caller passes a <Button> or a text action — this component
  does not style it.
- No illustration, no icon, no decorative graphic. Text only.
- Vertical alignment: the caller decides where to place the
  EmptyState inside its parent; this component is
  natural-height, not full-screen.

---

## TESTS

SectionHeader.test.tsx:

- renders the label
- renders the action slot when provided
- does not render the action slot when not provided

SettingsRow.test.tsx:

- renders the label
- renders the value when variant is 'value'
- renders the chevron glyph for 'chevron' and 'destructive'
- renders a Toggle when variant is 'toggle'
- calls onToggleChange when the Toggle is pressed
- calls onPress when the row is pressed
- the destructive label uses colors.error

Pill.test.tsx:

- renders the label
- calls onPress when pressed
- the selected state uses the primary background
  (assert by style value, not by rendered pixel)

Radio.test.tsx:

- renders the label when provided
- calls onPress when pressed
- does not call onPress when disabled

EmptyState.test.tsx:

- renders the title
- renders the message when provided
- does not render the message when not provided
- renders the action when provided

Behavior only. Do not test pixel sizes.

---

## CONSTRAINTS

- Path alias imports (@theme, @components).
- No default exports.
- No `any`.
- Every exported component has a JSDoc block.
- Use Pressable, not TouchableOpacity.
- Use tokens from @theme only. No hard-coded colors, spacings, radii.
- react-native-svg is available for the Radio check glyph.
- Import Toggle from @components/Toggle in SettingsRow.
- Do not modify any existing component.
- Do not touch /src/\_dev/.

---

## DELIVERABLES

Create all 20 files (5 components × 4 files each), then output:

1. Summary table: | File | Lines | Purpose |
2. `npx tsc --noEmit` result
3. `npx jest src/components/SectionHeader src/components/SettingsRow src/components/Pill src/components/Radio src/components/EmptyState` result
4. Any judgment calls

Then stop.
