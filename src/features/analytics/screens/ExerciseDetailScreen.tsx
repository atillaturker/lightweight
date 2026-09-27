/**
 * Exercise Detail — answers "am I getting stronger on this lift?".
 *
 * Reads durable history and the exercise library through the workout
 * feature's provider seams, and the display unit through the same seam, so
 * it never imports another feature directly. The hero is the current
 * estimated 1RM with its 8-week change; the chart switches between the 1RM,
 * volume, and reps series; the records and recent-sets lists round it out.
 * Read-only.
 */
import React, { useCallback, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import type { WeightUnit } from "@domain/entities";
import { Weight } from "@domain/value-objects";
import { Button } from "@components/Button";
import { Card } from "@components/Card";
import { EmptyState } from "@components/EmptyState";
import { ScreenHeader } from "@components/ScreenHeader";
import { SectionHeader } from "@components/SectionHeader";
import { TextTabs } from "@components/TextTabs";
import { colors, gutter, spacing, type } from "@theme";
import {
  formatDecimal,
  formatInteger,
  formatShortDate,
} from "@lib/format";
import { MoreGlyph } from "@features/workout";

import {
  ExerciseLineChart,
  RecentSetRow,
  RecordRow,
} from "../components";
import { useExerciseDetail } from "../hooks";
import type {
  ExerciseMetric,
  ExerciseRecordRow,
} from "../utils";

import type {
  HistoryStackParamList,
  ProgressStackParamList,
} from "@/app/navigation/types";

type Props =
  | NativeStackScreenProps<ProgressStackParamList, "ExerciseDetail">
  | NativeStackScreenProps<HistoryStackParamList, "ExerciseDetailFromHistory">;

/** Gap below the header before the hero. */
const HEADER_GAP = spacing.xxl;

/** Vertical gaps called out by the spec. */
const TAB_GAP = spacing.xxl;
const CHART_GAP = spacing.lg;
const CAPTION_GAP = spacing.md;
const SECTION_GAP = spacing.xxxl;
const SECTION_HEADER_GAP = spacing.md;

/** Rendered edge length of the overflow glyph. */
const MORE_GLYPH_SIZE = 20;

/** A record is "new" when achieved within this window. */
const RECENT_RECORD_MS = 30 * 24 * 60 * 60 * 1000;

const METRIC_OPTIONS = [
  { value: "1rm", label: "1RM" },
  { value: "volume", label: "Volume" },
  { value: "reps", label: "Reps" },
] as const;

/** Chart title per metric. */
const CHART_TITLES: Record<ExerciseMetric, string> = {
  "1rm": "ESTIMATED 1RM · LAST 8 WEEKS",
  volume: "VOLUME · LAST 8 WEEKS",
  reps: "TOTAL REPS · LAST 8 WEEKS",
};

/** Convert a stored kilogram value to a display figure for the unit. */
function formatWeightText(kg: number, unit: WeightUnit): string {
  const weight = Weight.fromKg(Math.max(0, kg));
  return formatDecimal(unit === "kg" ? weight.toKg() : weight.toLb(), 1);
}

/** Y-axis value formatter for the selected metric. */
function formatChartValue(metric: ExerciseMetric, value: number): string {
  return metric === "reps" ? formatInteger(value) : formatDecimal(value, 1);
}

/** Right-hand value text for a record row, in the user's unit. */
function recordValueText(row: ExerciseRecordRow, unit: WeightUnit): string {
  const weight = `${formatWeightText(row.weightKg, unit)} ${unit}`;
  switch (row.type) {
    case "heaviest_set":
      return `${weight} × ${row.reps}`;
    case "best_1rm":
      return weight;
    case "most_reps":
      return `${row.reps} reps · ${weight}`;
  }
}

/** Set summary for a recent-session row. */
function recentSummaryText(
  weightKg: number,
  reps: number,
  sets: number,
  unit: WeightUnit,
): string {
  const base = `${formatWeightText(weightKg, unit)} ${unit} × ${reps}`;
  return sets > 1 ? `${base} × ${sets}` : base;
}

/** The most recently achieved record within 30 days, or `null`. */
function badgeRecordType(
  records: ExerciseRecordRow[],
  now: number,
): ExerciseRecordRow["type"] | null {
  let latest: ExerciseRecordRow | null = null;
  for (const record of records) {
    if (record.achievedAt < now - RECENT_RECORD_MS) continue;
    if (latest === null || record.achievedAt > latest.achievedAt) latest = record;
  }
  return latest?.type ?? null;
}

/** Pushed per-exercise analytics screen, shared by the Progress and History tabs. */
export function ExerciseDetailScreen({ navigation, route }: Props): React.ReactElement {
  const { exerciseId } = route.params;
  const [metric, setMetric] = useState<ExerciseMetric>("1rm");
  const { exercise, unit, data } = useExerciseDetail(exerciseId, metric);
  const { width } = useWindowDimensions();

  const handleOverflow = useCallback((): void => {
    Alert.alert(exercise?.name ?? "Exercise", undefined, [
      { text: "Archive exercise", onPress: () => undefined },
      { text: "Cancel", style: "cancel" },
    ]);
  }, [exercise]);

  if (exercise === null) {
    return (
      <SafeAreaView edges={["top", "bottom"]} style={styles.container}>
        <ScreenHeader
          onBack={navigation.goBack}
          showBack
          testID="exercise-detail-header"
        />
        <View style={styles.centered}>
          <EmptyState
            action={
              <Button
                label="Go back"
                onPress={navigation.goBack}
                testID="exercise-detail-missing-back"
                variant="secondary"
              />
            }
            message="This exercise is no longer in your library."
            testID="exercise-detail-missing"
            title="Exercise not found"
          />
        </View>
      </SafeAreaView>
    );
  }

  const hasChart = data.points.some((value) => value !== null);
  const badgeType = badgeRecordType(data.records, Date.now());
  const chartWidth = width - gutter * 2;

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <ScreenHeader
        onBack={navigation.goBack}
        rightAction={
          <Pressable
            accessibilityLabel="Exercise options"
            accessibilityRole="button"
            hitSlop={spacing.xs}
            onPress={handleOverflow}
            testID="exercise-detail-more"
          >
            <MoreGlyph size={MORE_GLYPH_SIZE} />
          </Pressable>
        }
        showBack
        testID="exercise-detail-header"
        title={exercise.name}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        testID="exercise-detail-scroll"
      >
        <Text style={styles.heroLabel}>ESTIMATED 1RM</Text>
        <View style={styles.heroValueRow}>
          <Text style={styles.heroValue} testID="exercise-detail-hero-value">
            {data.heroE1RMKg === null
              ? "—"
              : formatWeightText(data.heroE1RMKg, unit)}
          </Text>
          {data.heroE1RMKg === null ? null : (
            <Text style={styles.heroUnit}>{unit}</Text>
          )}
        </View>

        {data.heroDeltaKg !== null ? (
          <Text
            style={[
              styles.heroDelta,
              data.heroDeltaKg > 0 ? styles.deltaPositive : null,
            ]}
            testID="exercise-detail-hero-delta"
          >
            {`${data.heroDeltaKg > 0 ? "▲" : "▼"} ${formatWeightText(
              Math.abs(data.heroDeltaKg),
              unit,
            )} ${unit} over 8 weeks`}
          </Text>
        ) : null}

        <View style={styles.tabBlock}>
          <TextTabs
            onChange={(value) => setMetric(value as ExerciseMetric)}
            options={[...METRIC_OPTIONS]}
            testID="exercise-detail-metric"
            value={metric}
          />
        </View>

        <Text style={styles.chartTitle}>{CHART_TITLES[metric]}</Text>

        {hasChart ? (
          <View style={styles.chartBlock}>
            <ExerciseLineChart
              formatValue={(value) => formatChartValue(metric, value)}
              points={data.points}
              testID="exercise-detail-chart"
              width={chartWidth}
            />
          </View>
        ) : (
          <Text style={styles.notEnough} testID="exercise-detail-no-chart">
            Not enough data yet
          </Text>
        )}

        <Text style={styles.caption}>{`Based on ${data.sessionCount} ${
          data.sessionCount === 1 ? "session" : "sessions"
        }`}</Text>

        <View style={styles.section}>
          <SectionHeader icon="trophy" label="Personal records" />
          {data.records.length === 0 ? (
            <Text style={styles.recordsEmpty} testID="exercise-detail-no-records">
              No records yet
            </Text>
          ) : (
            <View style={styles.rows}>
              <Card testID="exercise-detail-records-card">
                {data.records.map((row, index) => (
                  <RecordRow
                    dateText={formatShortDate(row.achievedAt)}
                    dividerTop={index > 0}
                    key={row.type}
                    label={row.label}
                    showBadge={row.type === badgeType}
                    testID={`exercise-detail-record-${row.type}`}
                    valueText={recordValueText(row, unit)}
                  />
                ))}
              </Card>
            </View>
          )}
        </View>

        {data.recentSets.length > 0 ? (
          <View style={styles.section}>
            <SectionHeader icon="clock" label="Recent sets" />
            <View style={styles.rows}>
              <Card testID="exercise-detail-recent-card">
                {data.recentSets.map((row, index) => (
                  <RecentSetRow
                    dateText={formatShortDate(row.startedAt)}
                    dividerTop={index > 0}
                    key={row.sessionId}
                    summaryText={recentSummaryText(
                      row.weightKg,
                      row.reps,
                      row.sets,
                      unit,
                    )}
                    testID={`exercise-detail-recent-${row.sessionId}`}
                  />
                ))}
              </Card>
            </View>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas },
  centered: { flex: 1, justifyContent: "center" },

  content: {
    paddingTop: HEADER_GAP,
    paddingBottom: spacing.huge,
    paddingHorizontal: gutter,
  },

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
  heroDelta: {
    ...type.label,
    marginTop: spacing.sm,
    color: colors.textMuted,
  },
  deltaPositive: { color: colors.success },

  tabBlock: { marginTop: TAB_GAP },
  chartTitle: {
    ...type.labelSmall,
    marginTop: CHART_GAP,
    letterSpacing: 0.66,
    textTransform: "uppercase",
    color: colors.textMuted,
  },
  chartBlock: { marginTop: spacing.sm },
  notEnough: {
    ...type.body,
    marginTop: spacing.xxl,
    fontSize: 14,
    textAlign: "center",
    color: colors.textMuted,
  },
  caption: {
    ...type.caption,
    marginTop: CAPTION_GAP,
    color: colors.textMuted,
  },

  section: { marginTop: SECTION_GAP },
  rows: { marginTop: SECTION_HEADER_GAP },
  recordsEmpty: {
    ...type.body,
    marginTop: SECTION_HEADER_GAP,
    fontSize: 14,
    textAlign: "center",
    color: colors.textMuted,
  },
});
