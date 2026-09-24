import React from "react";
import Svg, { Circle, Path, Polyline, Rect } from "react-native-svg";

import type { TabBarItem } from "./TabBar";

/** Rendered edge length of every tab glyph. */
export const TAB_ICON_SIZE = 22;

/** Props accepted by every monoline tab icon. */
export interface TabIconProps {
  /** Stroke color the glyph is drawn with. */
  color: string;
}

/**
 * Shared monoline attributes. Spread onto each SVG shape so every glyph
 * stays on the locked 1.5px round-capped outline spec.
 */
const STROKE = {
  fill: "none",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  strokeWidth: 1.5,
} as const;

/** House outline, used for the Today destination. */
export function TodayIcon({ color }: TabIconProps): React.ReactElement {
  return (
    <Svg height={TAB_ICON_SIZE} viewBox="0 0 24 24" width={TAB_ICON_SIZE}>
      <Path
        d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"
        stroke={color}
        {...STROKE}
      />
      <Path d="M9 21V12h6v9" stroke={color} {...STROKE} />
    </Svg>
  );
}

/** Three ascending vertical bars, used for the Progress destination. */
export function ProgressIcon({ color }: TabIconProps): React.ReactElement {
  return (
    <Svg height={TAB_ICON_SIZE} viewBox="0 0 24 24" width={TAB_ICON_SIZE}>
      <Rect height={7} rx={0.5} stroke={color} width={4} x={3} y={14} {...STROKE} />
      <Rect height={12} rx={0.5} stroke={color} width={4} x={10} y={9} {...STROKE} />
      <Rect height={17} rx={0.5} stroke={color} width={4} x={17} y={4} {...STROKE} />
    </Svg>
  );
}

/** Clock outline, used for the History destination. */
export function HistoryIcon({ color }: TabIconProps): React.ReactElement {
  return (
    <Svg height={TAB_ICON_SIZE} viewBox="0 0 24 24" width={TAB_ICON_SIZE}>
      <Circle cx={12} cy={12} r={9} stroke={color} {...STROKE} />
      <Polyline points="12 6 12 12 16 14" stroke={color} {...STROKE} />
    </Svg>
  );
}

/** Single-person outline, used for the Profile destination. */
export function ProfileIcon({ color }: TabIconProps): React.ReactElement {
  return (
    <Svg height={TAB_ICON_SIZE} viewBox="0 0 24 24" width={TAB_ICON_SIZE}>
      <Path
        d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
        stroke={color}
        {...STROKE}
      />
      <Circle cx={12} cy={7} r={4} stroke={color} {...STROKE} />
    </Svg>
  );
}

/**
 * Locked icon set keyed by `TabBarItem['icon']`. Each entry is a
 * monoline glyph that takes a single `color` prop. This is the only
 * icon source for the tab bar — no icon library is used.
 */
export const TabIcons: Record<TabBarItem["icon"], React.FC<TabIconProps>> = {
  today: TodayIcon,
  progress: ProgressIcon,
  history: HistoryIcon,
  profile: ProfileIcon,
};
