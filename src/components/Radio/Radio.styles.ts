import { StyleSheet } from "react-native";

import { colors, radii, spacing, type } from "@theme";

/** Diameter of the radio indicator. */
export const RADIO_SIZE = 22;

/** Rendered edge length of the check glyph inside the selected radio. */
export const RADIO_CHECK_SIZE = 10;

/** Gap between the indicator and its label. */
export const RADIO_LABEL_GAP = spacing.lg;

/** Minimum tap target for the pressable row. */
export const RADIO_MIN_HEIGHT = 44;

/**
 * Static styles for Radio. Selection is a color flip plus a check glyph;
 * there is no shadow, ring, or animation.
 */
export const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: RADIO_MIN_HEIGHT,
    gap: RADIO_LABEL_GAP,
  },

  indicator: {
    width: RADIO_SIZE,
    height: RADIO_SIZE,
    borderRadius: radii.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.canvas,
  },
  indicatorUnselected: {
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  indicatorSelected: {
    backgroundColor: colors.primary,
  },

  label: {
    ...type.body,
    color: colors.textPrimary,
  },
  labelDisabled: {
    ...type.body,
    color: colors.textMuted,
  },

  disabled: {
    opacity: 0.4,
  },
});
