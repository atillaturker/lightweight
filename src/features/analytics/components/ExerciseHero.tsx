/**
 * Exercise Detail hero: the current estimated 1RM, its 8-week change, and
 * the set it was estimated from — so the number is never a black box.
 * Receives display-ready text; unit conversion stays in the screen.
 */
import React from "react";
import { Text, View } from "react-native";

import { createStyles, spacing, type } from "@theme";

/** Props for {@link ExerciseHero}. */
export interface ExerciseHeroProps {
  /** The e1RM in the user's unit, or `null` when there is none. */
  valueText: string | null;
  unit: string;
  /** "▲ 5 kg over 8 weeks", or `null` without a comparison. */
  deltaText: string | null;
  /** Whether the change is an improvement (success color). */
  deltaPositive: boolean;
  /** "From 100 kg × 5", or `null` without an estimate. */
  sourceText: string | null;
}

/** The dominant number of Exercise Detail and its supporting lines. */
export function ExerciseHero({
  valueText,
  unit,
  deltaText,
  deltaPositive,
  sourceText,
}: ExerciseHeroProps): React.ReactElement {
  const styles = useStyles();
  return (
    <View>
      <Text style={styles.label}>ESTIMATED 1RM</Text>
      <View style={styles.valueRow}>
        <Text style={styles.value} testID="exercise-detail-hero-value">
          {valueText ?? "—"}
        </Text>
        {valueText === null ? null : <Text style={styles.unit}>{unit}</Text>}
      </View>
      {sourceText !== null ? (
        <Text style={styles.source} testID="exercise-detail-hero-source">
          {sourceText}
        </Text>
      ) : null}
      {deltaText !== null ? (
        <Text
          style={[styles.delta, deltaPositive ? styles.deltaPositive : null]}
          testID="exercise-detail-hero-delta"
        >
          {deltaText}
        </Text>
      ) : null}
    </View>
  );
}

const useStyles = createStyles((colors) => ({
  label: {
    ...type.labelSmall,
    letterSpacing: 0.66,
    textTransform: "uppercase",
    color: colors.textMuted,
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: spacing.xs + 2,
    gap: spacing.sm,
  },
  value: {
    ...type.metricHero,
    fontVariant: ["tabular-nums"],
    color: colors.textPrimary,
  },
  unit: {
    ...type.metric,
    fontFamily: "Inter-Medium",
    color: colors.textMuted,
  },
  source: {
    ...type.bodySmall,
    marginTop: spacing.xs,
    fontVariant: ["tabular-nums"],
    color: colors.textMuted,
  },
  delta: {
    ...type.label,
    marginTop: spacing.sm,
    color: colors.textMuted,
  },
  deltaPositive: { color: colors.success },
}));
