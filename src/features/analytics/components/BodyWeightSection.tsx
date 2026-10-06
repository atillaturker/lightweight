/**
 * Progress → "Body weight": the latest weight, its 30-day change, and the
 * weekly average over twelve weeks, with a "Log" action. The change is
 * muted either way — whether down is good depends on the user's goal.
 */
import React, { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

import type { WeightUnit } from "@domain/entities";
import { dayStartOf, isoDay, latestEntry, weeklyAverageWeights, weightChange } from "@domain/rules";
import { Weight } from "@domain/value-objects";
import { SectionHeader } from "@components/SectionHeader";
import { createStyles, spacing, type } from "@theme";
import { formatDecimal, formatShortDate } from "@lib/format";
import { LogWeightSheet, useBodyWeightActions, useBodyWeightStore } from "@features/bodyweight";

import { ExerciseLineChart } from "./ExerciseLineChart";
import { SECTION_CONTENT_GAP, SECTION_HEADER_HEIGHT } from "./sectionLayout";

const CHART_WEEKS = 12;
const CHANGE_DAYS = 30;

/** kg in the user's unit, one decimal at most. */
function inUnit(kg: number, unit: WeightUnit): string {
  const weight = Weight.fromKg(kg);
  return formatDecimal(unit === "kg" ? weight.toKg() : weight.toLb(), 1);
}

/** Props for {@link BodyWeightSection}. */
export interface BodyWeightSectionProps {
  unit: WeightUnit;
  width: number;
}

/** The body-weight section of Progress. */
export function BodyWeightSection({ unit, width }: BodyWeightSectionProps): React.ReactElement {
  const styles = useStyles();
  const entries = useBodyWeightStore((state) => state.entries);
  const { logWeight, removeEntry } = useBodyWeightActions();
  const [sheetOpen, setSheetOpen] = useState(false);

  const view = useMemo(() => {
    const now = Date.now();
    const latest = latestEntry(entries);
    const today = latest !== null && latest.date === isoDay(now) ? latest : null;
    return {
      latest,
      today,
      change: weightChange(entries, CHANGE_DAYS, now),
      weeks: weeklyAverageWeights(entries, now, CHART_WEEKS),
    };
  }, [entries]);
  const plotted = view.weeks.filter((value) => value !== null).length;

  return (
    <View testID="body-weight-section">
      <View style={styles.header}>
        <SectionHeader
          action={
            <Pressable
              accessibilityLabel="Log body weight"
              accessibilityRole="button"
              onPress={() => setSheetOpen(true)}
              style={styles.action}
              testID="body-weight-log"
            >
              <Text style={styles.actionLabel}>Log</Text>
            </Pressable>
          }
          label="Body weight"
        />
      </View>
      {view.latest === null ? (
        <Text style={styles.empty}>Log your weight to see the trend.</Text>
      ) : (
        <>
          <View style={styles.valueRow}>
            <Text style={styles.value} testID="body-weight-latest">{inUnit(view.latest.weightKg, unit)}</Text>
            <Text style={styles.unit}>{unit}</Text>
          </View>
          <Text style={styles.meta} testID="body-weight-meta">
            {formatShortDate(dayStartOf(view.latest.date))}
            {view.change === null ? "" : ` · ${view.change > 0 ? "▲" : view.change < 0 ? "▼" : "±"} ${inUnit(Math.abs(view.change), unit)} ${unit} in ${CHANGE_DAYS} days`}
          </Text>
          {plotted >= 2 ? (
            <View style={styles.chart}>
              <ExerciseLineChart
                axisLabels={["12 wk ago", "Now"]}
                formatValue={(kg) => inUnit(kg, unit)}
                points={view.weeks}
                testID="body-weight-chart"
                width={width}
              />
            </View>
          ) : (
            <Text style={styles.empty}>Log a few weeks to see the trend.</Text>
          )}
        </>
      )}
      <LogWeightSheet
        onClose={() => setSheetOpen(false)}
        onRemoveToday={() => (view.today === null ? undefined : removeEntry(view.today.date))}
        onSave={logWeight}
        todayKg={view.today?.weightKg ?? null}
        unit={unit}
        visible={sheetOpen}
      />
    </View>
  );
}

const useStyles = createStyles((colors) => ({
  header: { height: SECTION_HEADER_HEIGHT, justifyContent: "center" },
  action: { minHeight: SECTION_HEADER_HEIGHT, justifyContent: "center" },
  actionLabel: { ...type.label, color: colors.textMuted },
  valueRow: { flexDirection: "row", alignItems: "baseline", gap: spacing.sm, marginTop: SECTION_CONTENT_GAP },
  value: { ...type.metricLarge, fontVariant: ["tabular-nums"], color: colors.textPrimary },
  unit: { ...type.label, color: colors.textMuted },
  meta: { ...type.bodySmall, marginTop: spacing.xs, fontVariant: ["tabular-nums"], color: colors.textMuted },
  chart: { marginTop: spacing.lg },
  empty: { ...type.bodySmall, marginTop: SECTION_CONTENT_GAP, color: colors.textMuted },
}));
