/**
 * Progress hero: the selected metric's total for the period, its change
 * against the previous period, the other totals as context, and the
 * average/peak trend line. Moved out of ProgressScreen unchanged.
 */
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { colors, spacing, type } from "@theme";
import { formatDecimal, formatInteger } from "@lib/format";

import type { ProgressMetric, ProgressRange, ProgressTotals } from "../utils";

/** Props for {@link ProgressHero}. */
export interface ProgressHeroProps {
  metric: ProgressMetric;
  totals: ProgressTotals;
  delta: number | null;
  range: ProgressRange;
  hasPeriod: boolean;
  avgPerBucket: number;
  peak: number;
  peakLabel: string;
}

/** Hero label, unit, and value formatter per metric. */
const METRIC_DISPLAY: Record<
  ProgressMetric,
  { label: string; unit?: string; format: (value: number) => string }
> = {
  volume: {
    label: "TOTAL VOLUME",
    unit: "t",
    format: (value) => formatDecimal(value / 1000, 1),
  },
  sets: { label: "TOTAL SETS", format: formatInteger },
  reps: { label: "TOTAL REPS", format: formatInteger },
  time: {
    label: "TOTAL TIME",
    unit: "h",
    format: (value) => formatDecimal(value / 60, 1),
  },
  sessions: { label: "TOTAL SESSIONS", format: formatInteger },
};

/** The context row's fields, in spec order; the selected metric is dropped. */
const CONTEXT_FIELDS: {
  key: ProgressMetric;
  render: (totals: ProgressTotals) => string;
}[] = [
  { key: "sessions", render: (t) => `${formatInteger(t.sessions)} sessions` },
  { key: "sets", render: (t) => `${formatInteger(t.sets)} sets` },
  { key: "reps", render: (t) => `${formatInteger(t.reps)} reps` },
  { key: "time", render: (t) => `${formatDecimal(t.time / 60, 1)}h` },
];

/** The hero block: label, value + unit, delta, context, trend context. */
export function ProgressHero({
  metric,
  totals,
  delta,
  range,
  hasPeriod,
  avgPerBucket,
  peak,
  peakLabel,
}: ProgressHeroProps): React.ReactElement {
  const display = METRIC_DISPLAY[metric];
  const unitWord = range === "4W" || range === "12W" ? "weeks" : "months";
  const count = range === "4W" ? 4 : range === "12W" ? 12 : range === "6M" ? 6 : 12;
  const contextFields = CONTEXT_FIELDS.filter((field) => field.key !== metric);

  return (
    <View>
      <Text style={styles.heroLabel} testID="progress-hero-label">
        {display.label}
      </Text>

      <View style={styles.heroValueRow}>
        <Text style={styles.heroValue} testID="progress-hero-value">
          {display.format(totals[metric])}
        </Text>
        {display.unit !== undefined ? (
          <Text style={styles.heroUnit}>{display.unit}</Text>
        ) : null}
      </View>

      {delta !== null ? (
        <Text
          style={[styles.delta, delta > 0 ? styles.deltaPositive : null]}
          testID="progress-hero-delta"
        >
          {`${delta > 0 ? "▲" : "▼"} ${formatDecimal(Math.abs(delta), 1)}% vs previous ${count} ${unitWord}`}
        </Text>
      ) : null}

      <Text style={styles.context} testID="progress-context">
        {contextFields.map((field, index) => (
          <React.Fragment key={field.key}>
            {index > 0 ? <Text style={styles.contextDivider}> · </Text> : null}
            {field.render(totals)}
          </React.Fragment>
        ))}
      </Text>

      {hasPeriod ? (
        <Text style={styles.trend} testID="progress-trend">
          {`Avg ${display.format(avgPerBucket)}/${unitWord} · Peak ${display.format(peak)} (${peakLabel})`}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  heroLabel: {
    ...type.labelSmall,
    letterSpacing: 0.66,
    textTransform: "uppercase",
    color: colors.textMuted,
  },
  heroValueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: spacing.xs + 2,
    gap: spacing.sm,
  },
  heroValue: {
    ...type.metricHero,
    fontVariant: ["tabular-nums"],
    color: colors.textPrimary,
  },
  heroUnit: {
    ...type.metric,
    fontFamily: "Inter-Medium",
    color: colors.textMuted,
  },
  delta: {
    ...type.label,
    marginTop: spacing.sm,
    color: colors.textMuted,
  },
  deltaPositive: { color: colors.success },
  context: {
    ...type.bodySmall,
    marginTop: spacing.lg,
    fontVariant: ["tabular-nums"],
    color: colors.textMuted,
  },
  contextDivider: { color: colors.textDivider },
  trend: {
    ...type.bodySmall,
    marginTop: spacing.xs,
    fontVariant: ["tabular-nums"],
    color: colors.textMuted,
  },
});
