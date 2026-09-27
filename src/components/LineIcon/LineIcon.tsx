import React from "react";
import Svg, { Path } from "react-native-svg";

import { colors } from "@theme";

/** Names of the shared monoline glyphs. */
export type LineIconName =
  | "clock"
  | "trophy"
  | "flame"
  | "trend"
  | "list"
  | "sliders"
  | "database"
  | "device";

/**
 * Locked path per glyph, authored on the 24-unit grid like the tab bar
 * and muscle icons. Stroke only — never filled.
 */
const ICON_PATHS: Record<LineIconName, string> = {
  // Clock face with hands — time, history, recency.
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 7v5l3 2",
  // Cup on a stem — personal records.
  trophy:
    "M7 4h10v5a5 5 0 0 1-10 0z M7 6H4v1a3 3 0 0 0 3 3 M17 6h3v1a3 3 0 0 1-3 3 M12 14v3 M8 20h8 M9 17h6",
  // Single flame — streaks.
  flame:
    "M12 3c.5 3 5 5 5 10a5 5 0 0 1-10 0c0-2.5 1.5-4 2.5-5.5.5 1.5 1.5 2.5 2.5 3 .5-2.5-.5-5-0-7.5z",
  // Rising line with arrowhead — progression.
  trend: "M4 17l5-5 4 4 7-7 M15 9h5v5",
  // Stacked lines — routines, ordered lists.
  list: "M4 6h16 M4 12h16 M4 18h10",
  // Two sliders — training preferences.
  sliders: "M4 7h10 M18 7h2 M16 5v4 M4 17h4 M12 17h8 M10 15v4",
  // Cylinder — stored data.
  database:
    "M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3z M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6 M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3",
  // Phone outline — app settings.
  device: "M7 3h10a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z M11 18h2",
};

/** Props for {@link LineIcon}. */
export interface LineIconProps {
  /** Which glyph to draw. */
  name: LineIconName;
  /** Rendered edge length in px. 16 in headers and metric labels, 20 in
   *  list rows, 32 in empty states. Defaults to 16. */
  size?: number;
  /** Stroke color: `colors.textMuted` (default) or `colors.textPrimary`. */
  color?: string;
  testID?: string;
}

/**
 * Shared monoline glyph for section headers, metric labels and empty
 * states ("Design enrichment v3", rule 6). 1.5px stroke, round caps, no
 * fill. Muscle groups use `MuscleIcon`; the tab bar keeps its own paths.
 */
export function LineIcon({
  name,
  size = 16,
  color = colors.textMuted,
  testID,
}: LineIconProps): React.ReactElement {
  return (
    <Svg
      fill="none"
      height={size}
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      testID={testID}
      viewBox="0 0 24 24"
      width={size}
    >
      <Path d={ICON_PATHS[name]} />
    </Svg>
  );
}
