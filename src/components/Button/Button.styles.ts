import type { Insets } from "react-native";
import { StyleSheet } from "react-native";

import { radii, spacing, type, createStyles } from "@theme";

/**
 * Expands the touch target of every button by 4px on each edge without
 * changing its rendered box.
 */
export const hitSlop: Insets = {
  top: spacing.xs,
  bottom: spacing.xs,
  left: spacing.xs,
  right: spacing.xs,
};

/**
 * Static styles for Button. Dynamic values (variant, pressed, disabled)
 * are composed as style arrays inside the component.
 */
export const useStyles = createStyles((colors) => ({
  base: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.control,
  },

  fullWidth: {
    alignSelf: "stretch",
  },

  // ─── Variants ─────────────────────────────────────────
  primary: {
    height: 52,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.primary,
  },
  secondary: {
    height: 52,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.canvas,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  text: {
    height: 44,
    paddingHorizontal: spacing.sm,
    backgroundColor: "transparent",
  },

  // ─── Pressed ──────────────────────────────────────────
  primaryPressed: {
    backgroundColor: colors.primaryHover,
  },
  secondaryPressed: {
    backgroundColor: colors.surface,
  },
  textPressed: {
    opacity: 0.6,
  },

  // ─── States ───────────────────────────────────────────
  disabled: {
    opacity: 0.4,
  },

  // ─── Content ──────────────────────────────────────────
  icon: {
    marginRight: spacing.sm,
  },
  labelPrimary: {
    ...type.button,
    color: colors.onPrimary,
  },
  labelSecondary: {
    ...type.button,
    color: colors.textPrimary,
  },
  labelText: {
    ...type.buttonSmall,
    color: colors.textPrimary,
  },
  /**
   * Keeps the label laid out but invisible while loading, so the button
   * box never changes size when the spinner replaces the label.
   */
  labelHidden: {
    opacity: 0,
  },
  loader: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
}));

/** Pressed style key per variant, for lookup in the themed stylesheet. */
export const pressedStyles = {
  primary: "primaryPressed",
  secondary: "secondaryPressed",
  text: "textPressed",
} as const;

/** Label style key per variant, for lookup in the themed stylesheet. */
export const labelStyles = {
  primary: "labelPrimary",
  secondary: "labelSecondary",
  text: "labelText",
} as const;

/** Variant style key per variant, for lookup in the themed stylesheet. */
export const variantStyles = {
  primary: "primary",
  secondary: "secondary",
  text: "text",
} as const;
