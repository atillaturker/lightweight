# Fix — Rewrite TabBar icons using react-native-svg

## Context

Image + SVG data URI does not render TabBar icons on Android.
Android's native ImageView does not decode SVG. We are switching
TabBar icons to the `react-native-svg` library, which is now
installed via `npx expo install react-native-svg` and bundled with
Expo Go.

ScreenHeader, Radio, and SettingsRow currently use data URIs and
DO render (short, single-path SVGs work by exception). Do NOT touch
those files. Only convert TabBar icons.

## Files to modify

- /src/components/TabBar/TabBar.icons.tsx

## Rewrite rules

Import from react-native-svg:
import Svg, { Path, Circle, Rect, Polyline } from 'react-native-svg';

Each icon component renders an <Svg> with the exact attributes:

<Svg width={22} height={22} viewBox="0 0 24 24" fill="none"
       stroke={color} strokeWidth={1.5} strokeLinecap="round"
       strokeLinejoin="round">

Inside, render the SHAPE ELEMENTS (do not combine into one path;
react-native-svg supports multiple children natively).

Today:
<Path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
<Path d="M9 21V12h6v9" />

Progress:
<Rect x={3}  y={14} width={4} height={7}  rx={0.5} />
<Rect x={10} y={9}  width={4} height={12} rx={0.5} />
<Rect x={17} y={4}  width={4} height={17} rx={0.5} />

History:
<Circle cx={12} cy={12} r={9} />
<Polyline points="12 6 12 12 16 14" />

Profile:
<Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
<Circle cx={12} cy={7} r={4} />

Each icon still accepts the same TabIconProps interface
({ color: string }).

## Keep

- Same exported component names (TodayIcon, ProgressIcon, etc.)
- Same TAB_ICON_SIZE constant
- Same public interface

## Remove

- The `svgToDataUri` and `svgIcon` imports from @lib/svg
- The `STROKE` constant
- The `glyph()` helper

## Do not touch

- /src/lib/svg.ts (still used by ScreenHeader/Radio/SettingsRow)
- /src/components/ScreenHeader/
- /src/components/Radio/
- /src/components/SettingsRow/
- /src/components/TabBar/TabBar.tsx (public API unchanged)

## Verify

1. npx tsc --noEmit — clean
2. npx jest src/components/TabBar — all pass

## Deliverables

Report in 4 lines max:

- Files modified: N
- tsc: <clean | error count>
- jest: <X passed, Y failed>
- Confirmation that TabBar icons render on Android
