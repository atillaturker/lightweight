import React from "react";
import Svg, { Circle, Path, Polyline, Rect } from "react-native-svg";

import type { TabBarItem } from "./TabBar";

/** Rendered edge length of every tab glyph. */
export const TAB_ICON_SIZE = 22;

/** Shared monoline attributes: 1.5px round-capped, round-joined outline. */
const STROKE_WIDTH = 1.5;

/** Props accepted by every monoline tab icon. */
export interface TabIconProps {
  /** Stroke color the glyph is drawn with. */
  color: string;
}

/**
 * Shared monoline SVG frame. Every tab glyph is drawn inside the 24-unit
 * grid with a 1.5px stroked, round-capped, round-joined outline.
 */
function IconFrame({
  color,
  children,
}: TabIconProps & { children: React.ReactNode }): React.ReactElement {
  return (
    <Svg
      fill="none"
      height={TAB_ICON_SIZE}
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={STROKE_WIDTH}
      viewBox="0 0 24 24"
      width={TAB_ICON_SIZE}
    >
      {children}
    </Svg>
  );
}

/** House outline, used for the Today destination. */
export function TodayIcon({ color }: TabIconProps): React.ReactElement {
  return (
    <IconFrame color={color}>
      <Path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
      <Path d="M9 21V12h6v9" />
    </IconFrame>
  );
}

/** Three ascending vertical bars, used for the Progress destination. */
export function ProgressIcon({ color }: TabIconProps): React.ReactElement {
  return (
    <IconFrame color={color}>
      <Rect height={7} rx={0.5} width={4} x={3} y={14} />
      <Rect height={12} rx={0.5} width={4} x={10} y={9} />
      <Rect height={17} rx={0.5} width={4} x={17} y={4} />
    </IconFrame>
  );
}

/** Clock outline, used for the History destination. */
export function HistoryIcon({ color }: TabIconProps): React.ReactElement {
  return (
    <IconFrame color={color}>
      <Circle cx={12} cy={12} r={9} />
      <Polyline points="12 6 12 12 16 14" />
    </IconFrame>
  );
}

/** Single-person outline, used for the Profile destination. */
export function ProfileIcon({ color }: TabIconProps): React.ReactElement {
  return (
    <IconFrame color={color}>
      <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <Circle cx={12} cy={7} r={4} />
    </IconFrame>
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
