import type { Insets } from "react-native";
import { StyleSheet } from "react-native";

import { colors, spacing, type } from "@theme";

/** Drawn edge length of the checkbox square. */
export const TERMS_BOX_SIZE = 18;

/** Minimum height of the pressable row, per the 44px tap-target rule. */
export const TERMS_ROW_HEIGHT = 44;

/** Gap between the checkbox square and its label. */
export const TERMS_LABEL_GAP = spacing.sm;

/**
 * Expands the 18px box to a 44px tap target without changing its drawn
 * size: (44 - 18) / 2 = 13px on each edge.
 */
export const TERMS_HIT_SLOP: Insets = {
  top: (TERMS_ROW_HEIGHT - TERMS_BOX_SIZE) / 2,
  bottom: (TERMS_ROW_HEIGHT - TERMS_BOX_SIZE) / 2,
  left: (TERMS_ROW_HEIGHT - TERMS_BOX_SIZE) / 2,
  right: (TERMS_ROW_HEIGHT - TERMS_BOX_SIZE) / 2,
};

/**
 * Static styles for TermsCheckbox. The box is a square sibling of a
 * 44px-tall row so the tap target never inflates the drawn control.
 */
export const styles = StyleSheet.create({
  container: {
    width: "100%",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: TERMS_ROW_HEIGHT,
    gap: TERMS_LABEL_GAP,
  },

  box: {
    width: TERMS_BOX_SIZE,
    height: TERMS_BOX_SIZE,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: spacing.xs,
    backgroundColor: colors.canvas,
  },

  boxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  check: {
    ...type.labelSmall,
    color: colors.textInverse,
  },

  label: {
    ...type.bodySmall,
    flexShrink: 1,
    color: colors.textMuted,
  },

  link: {
    ...type.label,
    color: colors.textPrimary,
  },

  error: {
    ...type.caption,
    color: colors.error,
  },
});
