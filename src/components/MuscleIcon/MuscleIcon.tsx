import React from "react";
import Svg, { Path } from "react-native-svg";

import type { MuscleGroup } from "@domain/entities";
import { colors } from "@theme";

/**
 * Re-exported from the domain so the pictogram set and the exercise entity
 * cannot drift apart. There is exactly one `MuscleGroup` union; adding a
 * group here means adding it there (and vice versa).
 */
export type { MuscleGroup };

/** Props for {@link MuscleIcon}. */
export interface MuscleIconProps {
  /** Which pictogram to draw. */
  group: MuscleGroup;
  /** Rendered edge length in px. Defaults to 24. */
  size?: number;
  /** Stroke color. Defaults to `colors.textPrimary`. */
  color?: string;
  testID?: string;
}

/**
 * Locked monoline path per muscle group. Every glyph is authored on the
 * 24-unit grid and drawn as a single `<Path>` so multi-subpath icons
 * (chest, arms, legs, core) share one stroke style.
 */
const ICON_PATHS: Record<MuscleGroup, string> = {
  // Two horizontal lines — the chest shelf.
  chest: "M4 9h16 M4 15h16",
  // Triangle — the back.
  back: "M12 4l8 16H4z",
  // Arc — the shoulders curve.
  shoulders: "M4 16a8 8 0 0 1 16 0",
  // Two curves — biceps.
  arms: "M6 6c-2 4-2 8 0 12 M18 6c2 4 2 8 0 12",
  // Two vertical lines — legs.
  legs: "M9 4v16 M15 4v16",
  // Square with midline — abs.
  core: "M5 8h14v8H5z M5 12h14",
};

/**
 * Monoline pictogram for a muscle group. Shared by the Routine Editor and
 * the Exercise Picker, so it lives in `@components` rather than inside a
 * feature. Never filled, never shadowed — stroke only.
 */
export function MuscleIcon({
  group,
  size = 24,
  color = colors.textPrimary,
  testID,
}: MuscleIconProps): React.ReactElement {
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
      <Path d={ICON_PATHS[group]} />
    </Svg>
  );
}
