import { StyleSheet } from "react-native";

import { colors, spacing, type } from "@theme";

/** Value text size. The token scale has no 14px step, so it is set here. */
const VALUE_FONT_SIZE = 14;

/** Minimum row height, per the design system. */
export const SETTINGS_ROW_MIN_HEIGHT = 52;

/** Rendered edge length of the chevron glyph. */
export const SETTINGS_ROW_CHEVRON_SIZE = 16;

/**
 * Static styles for SettingsRow. The row carries no surface, border, or
 * shadow — the parent is responsible for the 1px hairline between rows.
 * Right-side spacing is composed as a style array in the component.
 */
export const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: SETTINGS_ROW_MIN_HEIGHT,
  },

  label: {
    ...type.body,
    color: colors.textPrimary,
  },
  labelDestructive: {
    ...type.body,
    color: colors.error,
  },

  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },

  value: {
    ...type.body,
    fontSize: VALUE_FONT_SIZE,
    color: colors.textMuted,
  },
});
