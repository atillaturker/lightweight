import type { Insets } from "react-native";
import { StyleSheet } from "react-native";

import { colors, radii, spacing, type } from "@theme";

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
export const styles = StyleSheet.create({
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
    color: colors.textInverse,
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
});

/** Pressed style per variant, keyed for lookup in the component. */
export const pressedStyles = {
  primary: styles.primaryPressed,
  secondary: styles.secondaryPressed,
  text: styles.textPressed,
} as const;

/** Label style per variant, keyed for lookup in the component. */
export const labelStyles = {
  primary: styles.labelPrimary,
  secondary: styles.labelSecondary,
  text: styles.labelText,
} as const;

/** Variant style per variant, keyed for lookup in the component. */
export const variantStyles = {
  primary: styles.primary,
  secondary: styles.secondary,
  text: styles.text,
} as const;
