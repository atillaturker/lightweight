/**
 * Progress — the app's primary analytics view.
 *
 * Reads durable session history through `useProgressData` and renders a
 * switchable time window and metric, a hero figure, a current-vs-previous
 * trend chart, a conditional PR strip, and a per-exercise delta list. All
 * metric math lives in `@domain/rules`; this screen only formats and lays
 * out. It is read-only.
 */
import React, { useCallback, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { Card } from "@components/Card";
import { LineIcon } from "@components/LineIcon";
import { SectionHeader } from "@components/SectionHeader";
import { SegmentedControl } from "@components/SegmentedControl";
import { TextTabs } from "@components/TextTabs";
import type { MuscleGroup } from "@domain/entities";
import { getExerciseLibrary } from "@features/workout";
import { useHistoryFilterStore } from "@features/history";
import { colors, gutter, radii, spacing, type } from "@theme";

import { ExerciseDeltaRow, PRStrip, ProgressBarChart, ProgressHero } from "../components";
import { useProgressData } from "../hooks";
import type {
  ProgressMetric,
  ProgressRange,
  ProgressTotals,
} from "../utils";

import type {
  MainTabParamList,
  ProgressStackParamList,
} from "@/app/navigation/types";

type Props = NativeStackScreenProps<ProgressStackParamList, "Progress">;

/** Gap below the header before the range selector. */
const HEADER_GAP = spacing.xl;

/** Vertical gaps called out by the spec. */
const METRIC_GAP = spacing.lg;
const HERO_GAP = spacing.xxl;
const CHART_GAP = spacing.xxl;
const CAPTION_GAP = spacing.md;
const SECTION_GAP = spacing.xxxl;

/** Circular filter button geometry. */
const FILTER_BUTTON_SIZE = 36;
const FILTER_GLYPH_SIZE = 20;

/** Sort action glyph. */
const SORT_GLYPH_SIZE = 12;

/** Empty-state glyph, per v3 rule 6. */
const EMPTY_GLYPH_SIZE = 32;

/** Border width of the hero + chart card. */
const CARD_BORDER = 1;

const RANGE_OPTIONS = [
  { value: "4W", label: "4W" },
  { value: "12W", label: "12W" },
  { value: "6M", label: "6M" },
  { value: "1Y", label: "1Y" },
] as const;

const METRIC_OPTIONS = [
  { value: "volume", label: "Volume" },
  { value: "sets", label: "Sets" },
  { value: "reps", label: "Reps" },
  { value: "time", label: "Time" },
  { value: "sessions", label: "Sessions" },
] as const;

/** No-op for the sort affordance, which ships in a later batch. */
function noop(): void {
  return undefined;
}

/** 20px monoline filter (funnel) glyph for the header action. */
function FilterGlyph(): React.ReactElement {
  return (
    <Svg
      fill="none"
      height={FILTER_GLYPH_SIZE}
      stroke={colors.textPrimary}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      viewBox="0 0 24 24"
      width={FILTER_GLYPH_SIZE}
    >
      <Path d="M4 5h16l-6 7v6l-4-2v-4z" />
    </Svg>
  );
}

/** 12px monoline sort glyph shown beside the "Sort" action. */
function SortGlyph(): React.ReactElement {
  return (
    <Svg
      fill="none"
      height={SORT_GLYPH_SIZE}
      stroke={colors.textMuted}
      strokeLinecap="round"
      strokeWidth={1.5}
      viewBox="0 0 24 24"
      width={SORT_GLYPH_SIZE}
    >
      <Path d="M5 7h14M5 12h9M5 17h5" />
    </Svg>
  );
}

/** Left-aligned title with the circular filter action on the right. */
function ProgressHeader({ onFilter }: { onFilter: () => void }): React.ReactElement {
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Progress</Text>

      <Pressable
        accessibilityLabel="Filter progress"
        accessibilityRole="button"
        onPress={onFilter}
        style={styles.filterButton}
        testID="progress-filter"
      >
        <FilterGlyph />
      </Pressable>
    </View>
  );
}

/** Centered first-run state, shown when no session exists at all. */
function ProgressEmptyState(): React.ReactElement {
  return (
    <View style={styles.empty} testID="progress-empty">
      <LineIcon name="trend" size={EMPTY_GLYPH_SIZE} />
      <Text style={styles.emptyTitle}>No data yet</Text>
      <Text style={styles.emptyMessage}>
        Complete a workout to see your progress here.
      </Text>
    </View>
  );
}

/** Root screen of the Progress tab. */
export function ProgressScreen({ navigation }: Props): React.ReactElement {
  const [range, setRange] = useState<ProgressRange>("12W");
  const [metric, setMetric] = useState<ProgressMetric>("volume");
  const data = useProgressData(range, metric);
  const { width } = useWindowDimensions();

  /**
   * Muscle group per exercise, for the "By exercise" row icons. Resolved
   * from the same library the read model uses to name the rows; unknown
   * exercises get no icon rather than a generic fallback.
   */
  const muscleByExercise = useMemo((): Map<string, MuscleGroup> => {
    const map = new Map<string, MuscleGroup>();
    for (const exercise of getExerciseLibrary()) {
      map.set(exercise.id, exercise.muscleGroup);
    }
    return map;
  }, []);

  /** Chart width inside the hero card: screen minus gutters and card padding. */
  const chartWidth =
    width - gutter * 2 - spacing.lg * 2 - CARD_BORDER * 2;

  const openPRHistory = useCallback((): void => {
    // Preselect the History filter so the tab opens on the PR list the
    // strip promises, instead of a filter the user then has to find.
    useHistoryFilterStore.getState().setFilter("pr");
    const tabs = navigation.getParent<BottomTabNavigationProp<MainTabParamList>>();
    tabs?.navigate("HistoryTab");
  }, [navigation]);

  const openExercise = useCallback(
    (exerciseId: string): void => {
      navigation.navigate("ExerciseDetail", { exerciseId });
    },
    [navigation],
  );

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <ProgressHeader onFilter={noop} />

      {!data.hasHistory ? (
        <ProgressEmptyState />
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          testID="progress-scroll"
        >
          <View style={styles.rangeBlock}>
            <SegmentedControl
              onChange={(value) => setRange(value as ProgressRange)}
              options={[...RANGE_OPTIONS]}
              testID="progress-range"
              value={range}
            />
          </View>

          <View style={styles.metricBlock}>
            <TextTabs
              onChange={(value) => setMetric(value as ProgressMetric)}
              options={[...METRIC_OPTIONS]}
              testID="progress-metric"
              value={metric}
            />
          </View>

          <View style={styles.heroCard} testID="progress-hero-card">
            <ProgressHero
              avgPerBucket={data.avgPerBucket}
              delta={data.hasPeriod ? data.deltas[metric] : null}
              hasPeriod={data.hasPeriod}
              metric={metric}
              peak={data.peak}
              peakLabel={data.peakLabel}
              range={range}
              totals={data.hasPeriod ? data.totals : EMPTY_TOTALS}
            />

            {data.hasPeriod ? (
              <>
                <View style={styles.chartBlock}>
                  <ProgressBarChart
                    buckets={data.buckets}
                    labelIndices={data.bucketLabelIndices}
                    testID="progress-chart"
                    width={chartWidth}
                  />
                </View>

                <Text style={styles.caption}>
                  Dark bars: this period · light bars: previous period
                </Text>
              </>
            ) : (
              <Text style={styles.periodEmpty} testID="progress-period-empty">
                No sessions in this period.
              </Text>
            )}
          </View>

          {data.prCount > 0 ? (
            <View style={styles.section}>
              <PRStrip count={data.prCount} onPress={openPRHistory} />
            </View>
          ) : null}

          {data.exerciseRows.length > 0 ? (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <SectionHeader
                  action={
                    <Pressable
                      accessibilityLabel="Sort exercises"
                      accessibilityRole="button"
                      onPress={noop}
                      style={styles.sortAction}
                      testID="progress-sort"
                    >
                      <SortGlyph />
                      <Text style={styles.sortLabel}>Sort</Text>
                    </Pressable>
                  }
                  icon="trend"
                  label="By exercise"
                />
              </View>

              <View style={styles.rows}>
                <Card testID="progress-exercise-card">
                  {data.exerciseRows.map((row, index) => (
                    <ExerciseDeltaRow
                      accent={index === 0 && (row.deltaPercent ?? 0) > 0}
                      dividerTop={index > 0}
                      key={row.exerciseId}
                      muscleGroup={muscleByExercise.get(row.exerciseId)}
                      onPress={() => openExercise(row.exerciseId)}
                      row={row}
                      testID={`progress-exercise-${row.exerciseId}`}
                      variant="inset"
                    />
                  ))}
                </Card>
              </View>
            </View>
          ) : null}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

/** Zero totals used when the selected period has no sessions. */
const EMPTY_TOTALS: ProgressTotals = {
  volume: 0,
  sets: 0,
  reps: 0,
  time: 0,
  sessions: 0,
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas },

  header: {
    height: 44,
    paddingHorizontal: gutter,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.canvas,
  },
  headerTitle: { ...type.sectionTitle, color: colors.textPrimary },
  filterButton: {
    width: FILTER_BUTTON_SIZE,
    height: FILTER_BUTTON_SIZE,
    borderRadius: FILTER_BUTTON_SIZE / 2,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.canvas,
    alignItems: "center",
    justifyContent: "center",
  },

  content: {
    paddingBottom: spacing.huge,
  },
  rangeBlock: {
    marginTop: HEADER_GAP,
    paddingHorizontal: gutter,
  },
  metricBlock: {
    marginTop: METRIC_GAP,
    paddingHorizontal: gutter,
  },
  /** Hero metric + trend chart: one flat card grouping one period's data. */
  heroCard: {
    marginTop: HERO_GAP,
    marginHorizontal: gutter,
    padding: spacing.lg,
    borderRadius: radii.card,
    borderWidth: CARD_BORDER,
    borderColor: colors.hairline,
    backgroundColor: colors.canvas,
  },

  chartBlock: {
    marginTop: CHART_GAP,
  },
  caption: {
    ...type.caption,
    marginTop: CAPTION_GAP,
    color: colors.textMuted,
  },
  periodEmpty: {
    ...type.body,
    fontSize: 14,
    marginTop: HERO_GAP,
    textAlign: "center",
    color: colors.textMuted,
  },

  section: { marginTop: SECTION_GAP },
  sectionHeader: {
    height: 44,
    paddingHorizontal: gutter,
    justifyContent: "center",
  },
  sortAction: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  sortLabel: { ...type.label, color: colors.textMuted },
  rows: { marginTop: spacing.sm, marginHorizontal: gutter },

  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: spacing.giant,
  },
  emptyTitle: {
    ...type.sectionTitle,
    marginTop: spacing.lg,
    color: colors.textPrimary,
  },
  emptyMessage: {
    ...type.body,
    marginTop: spacing.sm,
    fontSize: 14,
    color: colors.textMuted,
  },
});
