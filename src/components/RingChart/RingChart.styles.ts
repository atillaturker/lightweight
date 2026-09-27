import { StyleSheet } from "react-native";

import { colors, fineSpacing, type } from "@theme";

/**
 * Static styles for RingChart. The diameter and stroke width are
 * dynamic, so the root box is sized inline by the component; everything
 * here describes the centered label stack only.
 */
export const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },

  /** Absolutely centered label stack over the ring's hollow core. */
  center: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },

  centerLabel: {
    ...type.metricLarge,
    fontSize: 22,
    fontVariant: ["tabular-nums"],
    color: colors.textPrimary,
  },

  /** 2px below the main label, per the ring spec. */
  centerSublabel: {
    ...type.labelSmall,
    letterSpacing: 0,
    marginTop: fineSpacing.stack,
    color: colors.textMuted,
  },
});
