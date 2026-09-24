import { StyleSheet } from "react-native";

import { colors, radii, spacing, type } from "@theme";

/** Height of a single segment row, inside the track padding. */
export const SEGMENT_HEIGHT = 32;

/**
 * Static styles for SegmentedControl. Selection state is composed as a
 * style array inside the component.
 */
export const styles = StyleSheet.create({
  track: {
    flexDirection: "row",
    alignItems: "center",
    height: SEGMENT_HEIGHT + spacing.xs * 2,
    padding: spacing.xs,
    borderRadius: radii.control,
    backgroundColor: colors.surface,
  },

  segment: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: SEGMENT_HEIGHT,
    borderRadius: radii.control,
  },

  /** The selected segment reads as a raised chip on the track. */
  segmentSelected: {
    backgroundColor: colors.canvas,
    borderWidth: 1,
    borderColor: colors.hairline,
  },

  label: {
    ...type.label,
    color: colors.textMuted,
  },
  labelSelected: {
    ...type.label,
    color: colors.textPrimary,
  },
});
