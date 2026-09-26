import { StyleSheet } from "react-native";

import { colors, fonts, type } from "@theme";

/**
 * Static styles for SectionHeader. The row is a plain label baseline —
 * no background, border, shadow, or card. Vertical spacing is owned by
 * the parent so the header can sit in any section rhythm.
 *
 * Per "Design enrichment rules (v2)": section headers are 12px / 600
 * with 0.06em tracking — the color stays muted, only presence grows.
 */
export const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  label: {
    ...type.caption,
    fontFamily: fonts.bodySemiBold,
    letterSpacing: 0.72,
    textTransform: "uppercase",
    color: colors.textMuted,
  },
});
