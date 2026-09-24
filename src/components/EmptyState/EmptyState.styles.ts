import { StyleSheet } from "react-native";

import { colors, gutter, spacing, type } from "@theme";

/** Message text size. The token scale has no 14px step, so it is set here. */
const MESSAGE_FONT_SIZE = 14;

/** Vertical gap between title and message. */
export const EMPTY_STATE_TITLE_GAP = spacing.sm;

/** Vertical gap between message and action. */
export const EMPTY_STATE_ACTION_GAP = spacing.xxl;

/**
 * Static styles for EmptyState. Text-only, centered, and natural height —
 * the caller decides where in the parent it sits.
 */
export const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: gutter,
  },

  title: {
    ...type.sectionTitle,
    textAlign: "center",
    color: colors.textPrimary,
  },
  titleWithMessage: {
    marginBottom: EMPTY_STATE_TITLE_GAP,
  },

  message: {
    ...type.body,
    fontSize: MESSAGE_FONT_SIZE,
    textAlign: "center",
    color: colors.textMuted,
  },

  action: {
    marginTop: EMPTY_STATE_ACTION_GAP,
    alignItems: "center",
  },
});
