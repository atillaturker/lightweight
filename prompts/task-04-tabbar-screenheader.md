# Task 04 — TabBar, ScreenHeader

Create two shared UI primitives that form the navigation shell:
TabBar (bottom navigation) and ScreenHeader (top of every stack
screen).

Read first:
/AGENTS.md
/src/components/AGENTS.md
/src/theme/index.ts

react-native-svg is installed. Use it for the tab bar icons.

---

## File structure

/src/components/TabBar/

- TabBar.tsx
- TabBar.styles.ts
- TabBar.icons.tsx
- index.ts
- TabBar.test.tsx

/src/components/ScreenHeader/

- ScreenHeader.tsx
- ScreenHeader.styles.ts
- index.ts
- ScreenHeader.test.tsx

---

## TABBAR — SPEC

Props:

interface TabBarItem {
key: string;
label: string;
icon: 'today' | 'progress' | 'history' | 'profile';
}

interface TabBarProps {
items: TabBarItem[];
activeKey: string;
onSelect: (key: string) => void;
testID?: string;
}

Container:

- 1px top hairline, colors.hairline (#E5E7EB)
- Background colors.canvas (#FFFFFF)
- Height: 56px + safe-area bottom inset.
  Use `useSafeAreaInsets` from react-native-safe-area-context
  (already a dependency).
- No shadow, no blur, no rounded top corners.
- Horizontal flex direction, items evenly distributed
  (each item flex: 1).

Each item:

- Pressable, flex column, alignItems center, justifyContent center
- Icon 22x22, on top
- 4px vertical gap
- Label: Inter Medium 11px, single line, centered

Active state:

- Icon stroke: colors.primary (#111111)
- Label color: colors.primary

Inactive state:

- Icon stroke: colors.textMuted (#6B7280)
- Label color: colors.textMuted

Do NOT use a background pill on the active item. Do NOT use an
indicator bar. Do NOT tint icons. Color-only active state.

Icon set (LOCKED — exact SVG paths, do not substitute):

All icons: viewBox="0 0 24 24", fill="none", stroke=currentColor,
strokeWidth=1.5, strokeLinecap="round", strokeLinejoin="round",
width=22, height=22.

"today" (house):
<Path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
<Path d="M9 21V12h6v9" />

"progress" (three vertical bars, increasing height):
<Rect x={3}  y={14} width={4} height={7}  rx={0.5} />
<Rect x={10} y={9}  width={4} height={12} rx={0.5} />
<Rect x={17} y={4}  width={4} height={17} rx={0.5} />

"history" (clock):
<Circle cx={12} cy={12} r={9} />
<Polyline points="12 6 12 12 16 14" />

"profile" (person outline):
<Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
<Circle cx={12} cy={7} r={4} />

Place these in /src/components/TabBar/TabBar.icons.tsx as a record:

export const TabIcons: Record<TabBarItem['icon'], React.FC<{ color: string }>>

Each icon component accepts a `color` prop and sets stroke={color}.
Do not use @expo/vector-icons or any icon library.

Accessibility:

- Each item: accessibilityRole="tab"
- accessibilityState={{ selected: isActive }}
- accessibilityLabel={label}
- Container: accessibilityRole="tablist"

Do not render a badge count on any item. Do not render a notification
dot on any item. These states do not exist in this product.

---

## SCREENHEADER — SPEC

Props:

interface ScreenHeaderProps {
title?: string;
onBack?: () => void;
showBack?: boolean;
rightAction?: React.ReactNode;
testID?: string;
}

Spec:

- Height: 44px
- Horizontal padding: gutter (20px)
- Background: colors.canvas (#FFFFFF)
- NO bottom hairline
- NO shadow

Layout: three-slot flex row
Left: if showBack, a 44px tap target containing a 20px back
chevron in colors.textPrimary. Draw the chevron as an
inline SVG (react-native-svg) with path:
<Path d="M15 18l-6-6 6-6" />
stroke=currentColor, strokeWidth=1.5, fill=none,
strokeLinecap="round", strokeLinejoin="round",
viewBox="0 0 24 24".
If !showBack, an empty 44px spacer View.
Center: if title, Inter SemiBold 16px, colors.textPrimary,
text-align center.
Right: if rightAction, render it.
If !rightAction, an empty 44px spacer View.

The three-slot structure keeps the title truly centered regardless
of which slots are filled.

Accessibility:

- Back button: accessibilityRole="button",
  accessibilityLabel="Go back"

Do not render a bottom border. Do not change background on scroll.
Do not render a title longer than one line — the caller is
responsible for shortening it.

---

## TESTS

TabBar.test.tsx:

- renders all item labels
- calls onSelect with the correct key when an item is pressed
- the active item's label uses the primary color
- an inactive item's label uses the muted color

ScreenHeader.test.tsx:

- renders the title when provided
- does not render a back chevron when showBack is false
- renders the back chevron when showBack is true
- calls onBack when the back chevron is pressed
- renders rightAction when provided

Behavior only. Do not test exact pixel sizes.

---

## CONSTRAINTS

- Path alias imports (@theme, @components).
- No default exports.
- No `any`.
- Every exported component has a JSDoc block.
- Use Pressable, not TouchableOpacity.
- Use tokens from @theme only. No hard-coded colors, spacings, radii.
- No new dependencies beyond react-native-svg (already installed).
- Do not modify any existing component.
- Do not touch /src/\_dev/.

---

## DELIVERABLES

Create all 10 files, then output:

1. Summary table: | File | Lines | Purpose |
2. `npx tsc --noEmit` result
3. `npx jest src/components/TabBar src/components/ScreenHeader` result
4. Any judgment calls

Then stop.
