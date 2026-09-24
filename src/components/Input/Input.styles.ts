import { StyleSheet } from "react-native";

import { colors, radii, spacing, type } from "@theme";

/** Space reserved on the right of the text input for an accessory. */
export const ACCESSORY_RIGHT_PADDING = 44;

/**
 * Static styles for Input. Focus, error and disabled states are applied
 * as style arrays inside the component so no inline layout objects leak
 * into the tree.
 */
export const styles = StyleSheet.create({
  container: {
    width: "100%",
  },

  label: {
    ...type.label,
    color: colors.textBody,
    marginBottom: spacing.sm,
  },

  /** Positions the optional accessory over the field box. */
  fieldWrap: {
    position: "relative",
  },

  field: {
    height: 52,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.canvas,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: radii.control,
    ...type.body,
    color: colors.textPrimary,
  },

  /** Text keeps clear of a right-aligned accessory. */
  fieldWithAccessory: {
    paddingRight: ACCESSORY_RIGHT_PADDING,
  },

  /** Right-aligned, vertically centered over the field box. */
  accessory: {
    position: "absolute",
    top: 0,
    bottom: 0,
    right: spacing.md,
    justifyContent: "center",
  },

  // ─── States ───────────────────────────────────────────
  focused: {
    borderColor: colors.primary,
  },
  errored: {
    borderColor: colors.error,
  },
  disabled: {
    opacity: 0.4,
  },

  // ─── Supporting text ──────────────────────────────────
  message: {
    ...type.caption,
    marginTop: spacing.xs,
  },
  helper: {
    color: colors.textMuted,
  },
  error: {
    color: colors.error,
  },
});
