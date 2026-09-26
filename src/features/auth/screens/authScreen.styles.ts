import { StyleSheet } from "react-native";

import { colors, spacing, type } from "@theme";

/**
 * Static styles shared by the sign-up and log-in screens.
 *
 * Both screens are a single scrolling column on the canvas: there is no
 * card, no surface fill, and no shadow. Vertical rhythm is composed from
 * the spacing scale only.
 */
export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas,
  },

  header: {
    paddingHorizontal: 0,
  },

  content: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
  },

  /** Headline sits 24px below the header, matching the 12px of top padding. */
  headline: {
    ...type.display,
    marginTop: spacing.md,
    color: colors.textPrimary,
  },

  supporting: {
    ...type.body,
    marginTop: spacing.sm,
    color: colors.textBody,
  },

  /** The form block starts 32px below the supporting text. */
  form: {
    marginTop: spacing.xxxl,
  },

  /** 20px vertical gap between consecutive fields. */
  fieldGap: {
    marginTop: spacing.xl,
  },

  /** Password strength bar sits 12px below the password field. */
  strength: {
    marginTop: spacing.md,
  },

  /** Right-aligned text action, 12px below the password field. */
  fieldAction: {
    alignItems: "flex-end",
    marginTop: spacing.md,
  },

  /** Terms row sits 20px below the form. */
  terms: {
    marginTop: spacing.xl,
  },

  /** Inline auth error rendered directly above the primary CTA. */
  inlineError: {
    ...type.bodySmall,
    marginBottom: spacing.sm,
    color: colors.error,
  },

  cta: {
    marginTop: spacing.xl,
  },

  /** Divider row, 16px below the primary CTA. */
  divider: {
    marginTop: spacing.lg,
  },

  /** Provider buttons, 16px below the divider. */
  providers: {
    marginTop: spacing.lg,
  },

  /** 12px between the two provider buttons. */
  providerGap: {
    marginTop: spacing.md,
  },

  /** Account switch row, 24px below the provider buttons. */
  switchRow: {
    alignItems: "center",
    marginTop: spacing.xxl,
  },

  switchLabel: {
    ...type.bodySmall,
    color: colors.textMuted,
  },

  switchAction: {
    ...type.label,
    color: colors.textPrimary,
  },
});
