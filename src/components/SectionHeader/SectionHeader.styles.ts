import { StyleSheet } from "react-native";

import { colors, type } from "@theme";

/**
 * Static styles for SectionHeader. The row is a plain label baseline —
 * no background, border, shadow, or card. Vertical spacing is owned by
 * the parent so the header can sit in any section rhythm.
 */
export const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  label: {
    ...type.labelSmall,
    textTransform: "uppercase",
    color: colors.textMuted,
  },
});
