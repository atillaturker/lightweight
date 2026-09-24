# AGENTS.md — Shared components

Cross-feature UI primitives. Every component here is used by at least
two features. If a component is used by only one feature, it belongs
inside that feature's `components/` folder.

## Rules

- Props use a `variant` field, not boolean flags.
  `variant: 'primary' | 'secondary'` — NOT `isPrimary`.
- Root element spreads `...rest`.
- No screen-specific logic. No navigation. No store access.
- Styles via `StyleSheet.create`. Inline objects only for dynamic
  values (width, transform).
- Every component has an `index.ts` that re-exports the public API.
- Every component has a JSDoc block describing its variants and props.

## Component contracts

- **Button** — exactly one `variant="primary"` per screen. Never
  disabled; validation runs on submit.
- **Input** — 52px height, 8px radius, focus border `#111111`, no glow.
- **SegmentedControl** — 8px radius (NOT pill). Pill only for badges.
- **TextTabs** — active tab 600 weight with a 2px underline.
  Inactive is 500 weight, no underline.
- **TabBar** — locked SVG paths, monoline 1.5px stroke, color-only
  active state. Never substitute `@expo/vector-icons`.
- **Badge** — pill radius, `#F5F5F5` fill, 1px `#E5E7EB` border.
- **Toggle** — 44x24px track, pill radius. Off `#E5E7EB`, on `#111111`.

## Naming

Folder `PascalCase/` with `ComponentName.tsx`, `index.ts`, and
optionally `ComponentName.styles.ts`.

## Do not

- Do not add drop shadows. Use 1px hairline borders for separation.
- Do not use pill radius on anything except badges and filters.
- Do not wrap content in cards unless explicitly designed that way.
- Do not hard-code colors or spacings. Always import from `@theme`.
- Do not accept a `style` prop that overrides layout primitives —
  expose variants instead.
