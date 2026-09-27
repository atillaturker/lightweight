import { StyleSheet } from "react-native";

import { colors, radii, spacing, type } from "@theme";

/**
 * Static styles for Badge. Both variants share the same surface; the `pr`
 * variant only recolors its label.
 */
export const styles = StyleSheet.create({
  base: {
    alignSelf: "flex-start",
    alignItems: "center",
    justifyContent: "center",
    height: 20,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.hairline,
  },

  label: {
    ...type.labelSmall,
    textTransform: "uppercase",
    color: colors.textPrimary,
  },
  labelPR: {
    color: colors.success,
  },
});
