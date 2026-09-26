import { StyleSheet } from "react-native";

import { colors, spacing, type } from "@theme";

/** Height of the bar plot area, excluding the label row and x-axis. */
export const BAR_PLOT_HEIGHT = 96;

/** Width of a single volume bar. */
export const BAR_WIDTH = 6;

/** Corner radius on the top of each bar. */
export const BAR_RADIUS = 1;

/**
 * Static styles for the Welcome monthly stat row: a goal ring beside a
 * miniature weekly-volume bar chart. The row sits directly on the white
 * canvas — no card, border, or background fill.
 */
export const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  /** Left block — the goal ring, vertically centered. */
  ringBlock: {
    width: "40%",
    alignItems: "center",
    justifyContent: "center",
  },

  /** Right block — label row over the bar plot over the x-axis. */
  chartBlock: {
    flex: 1,
    marginLeft: spacing.xl,
  },

  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  labelCaption: {
    ...type.labelSmall,
    fontSize: 10,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: colors.textMuted,
  },

  labelValue: {
    fontFamily: "Inter-SemiBold",
    fontSize: 13,
    fontVariant: ["tabular-nums"],
    color: colors.textPrimary,
  },

  /** 6px below the label row, per the welcome stat spec. */
  plot: {
    height: BAR_PLOT_HEIGHT,
    marginTop: 6,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
  },

  bar: {
    width: BAR_WIDTH,
    borderTopLeftRadius: BAR_RADIUS,
    borderTopRightRadius: BAR_RADIUS,
    backgroundColor: colors.primary,
  },

  axisRow: {
    marginTop: spacing.xs,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  axisLabel: {
    fontFamily: "Inter-Medium",
    fontSize: 10,
    color: colors.textMuted,
  },
});
