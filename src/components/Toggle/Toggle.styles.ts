import { StyleSheet } from "react-native";

import { colors, radii, spacing } from "@theme";

/** Rendered track size. Kept as constants so the knob math stays exact. */
export const TRACK_WIDTH = 44;
export const TRACK_HEIGHT = 24;
export const KNOB_SIZE = 20;
export const KNOB_INSET = 2;

/** Horizontal travel of the knob, from the off position to the on position. */
export const KNOB_TRAVEL = TRACK_WIDTH - KNOB_SIZE - KNOB_INSET * 2;

/**
 * Static styles for Toggle. Animated values (knob translate, track
 * color) are applied inline inside the component.
 */
export const styles = StyleSheet.create({
  /**
   * Pressable wrapper. Stretches the touch target to the 44px minimum
   * without changing the 24px track box that is actually drawn.
   */
  pressable: {
    alignSelf: "flex-start",
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: spacing.xs,
  },

  track: {
    width: TRACK_WIDTH,
    height: TRACK_HEIGHT,
    borderRadius: radii.pill,
    justifyContent: "center",
  },

  knob: {
    width: KNOB_SIZE,
    height: KNOB_SIZE,
    borderRadius: radii.pill,
    backgroundColor: colors.canvas,
  },

  disabled: {
    opacity: 0.4,
  },
});
