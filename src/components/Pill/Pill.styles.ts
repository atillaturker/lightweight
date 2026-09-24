import { StyleSheet } from "react-native";

import { colors, radii, spacing, type } from "@theme";

/** Rendered pill height. */
export const PILL_HEIGHT = 32;

/**
 * Static styles for Pill. Selection state is composed as a style array
 * inside the component — selected is a solid primary fill, unselected is
 * a white chip with a hairline border.
 */
export const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
    height: PILL_HEIGHT,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
  },

  unselected: {
    backgroundColor: colors.canvas,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  selected: {
    backgroundColor: colors.primary,
  },

  label: {
    ...type.label,
    color: colors.textPrimary,
  },
  labelSelected: {
    ...type.label,
    color: colors.textInverse,
  },
});
