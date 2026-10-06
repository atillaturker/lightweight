/**
 * Exercise Detail — answers "am I getting stronger on this lift?".
 *
 * Reads durable history and the exercise library through the workout
 * feature's provider seams, and the display unit through the same seam. The
 * hero is the current estimated 1RM with its 8-week change; the chart
 * switches between the 1RM, volume, and reps series; the records and
 * recent-sets lists follow, and the routines feature's technique section
 * (illustration + how-to steps) closes the screen. Read-only.
 */
import React, { useCallback, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { Button } from "@components/Button";
import { Card } from "@components/Card";
import { EmptyState } from "@components/EmptyState";
import { ScreenHeader } from "@components/ScreenHeader";
import { SectionHeader } from "@components/SectionHeader";
import { TextTabs } from "@components/TextTabs";
import { gutter, spacing, type, createStyles } from "@theme";
import { formatShortDate } from "@lib/format";
import {
  ExerciseTechnique,
  useCustomExerciseStore,
  useSetCustomExerciseArchived,
} from "@features/routines";
import { MoreGlyph } from "@features/workout";

import {
  ExerciseHero,
  ExerciseLineChart,
  RecentSetRow,
  RecordRow,
} from "../components";
import { useExerciseDetail } from "../hooks";
import {
  CHART_TITLES,
  formatChartValue,
  heroTexts,
  METRIC_LABELS,
  recentSummaryText,
  recordValueText,
  type ExerciseMetric,
  type ExerciseRecordRow,
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
  const styles = useStyles();
  const { exerciseId } = route.params;
  const [metric, setMetric] = useState<ExerciseMetric>("1rm");
  const { exercise, unit, data } = useExerciseDetail(exerciseId, metric);
  const { width } = useWindowDimensions();

  // Live archive state of a custom exercise (`undefined` for built-ins), so
  // the menu and the note update the moment it changes.
  const archived = useCustomExerciseStore(
    (state) => state.exercises.find((entry) => entry.id === exerciseId)?.isArchived,
  );
  const setArchived = useSetCustomExerciseArchived();

  /** Only custom exercises have options: archive, or restore when archived. */
  const handleOverflow = useCallback((): void => {
    if (archived === undefined) return;
    const action = archived
      ? { text: "Restore exercise", onPress: () => setArchived(exerciseId, false) }
      : {
          text: "Archive exercise",
          style: "destructive" as const,
          onPress: () => setArchived(exerciseId, true),
        };
    Alert.alert(
      exercise?.name ?? "Exercise",
      archived
        ? "Restoring brings it back to the exercise picker."
        : "Archiving hides it from the exercise picker. Your history keeps it.",
      [action, { text: "Cancel", style: "cancel" }],
    );
  }, [archived, exercise, exerciseId, setArchived]);

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
  // The read model decides which metrics this exercise offers (by kind,
  // plus "Effort" once a set is rated) and which one is shown.
  const metricOptions = data.metrics.map((value) => ({ value, label: METRIC_LABELS[value] }));
  const hero = heroTexts(data.hero, unit);
  const badgeType = badgeRecordType(data.records, Date.now());
  const chartWidth = width - gutter * 2;

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <ScreenHeader
        onBack={navigation.goBack}
        rightAction={
          archived === undefined ? undefined : (
            <Pressable
              accessibilityLabel="Exercise options"
              accessibilityRole="button"
              hitSlop={spacing.xs}
              onPress={handleOverflow}
              testID="exercise-detail-more"
            >
              <MoreGlyph size={MORE_GLYPH_SIZE} />
            </Pressable>
          )
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
        {archived === true ? (
          <Text style={styles.archivedNote} testID="exercise-detail-archived">
            Archived · hidden from the exercise picker
          </Text>
        ) : null}
        <ExerciseHero
          deltaPositive={hero.deltaPositive}
          deltaText={hero.deltaText}
          label={hero.label}
          sourceText={hero.sourceText}
          unit={hero.unit}
          valueText={hero.valueText}
        />

        <View style={styles.tabBlock}>
          <TextTabs
            onChange={(value) => setMetric(value as ExerciseMetric)}
            options={metricOptions}
            testID="exercise-detail-metric"
            value={data.metric}
          />
        </View>

        <Text style={styles.chartTitle}>{CHART_TITLES[data.metric]}</Text>

        {hasChart ? (
          <View style={styles.chartBlock}>
            <ExerciseLineChart
              formatValue={(value) => formatChartValue(data.metric, value)}
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
                    summaryText={recentSummaryText(row, unit)}
                    testID={`exercise-detail-recent-${row.sessionId}`}
                  />
                ))}
              </Card>
            </View>
          </View>
        ) : null}

        <View style={styles.section}>
          <ExerciseTechnique contentWidth={chartWidth} exercise={exercise} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const useStyles = createStyles((colors) => ({
  container: { flex: 1, backgroundColor: colors.canvas },
  centered: { flex: 1, justifyContent: "center" },

  content: {
    paddingTop: HEADER_GAP,
    paddingBottom: spacing.huge,
    paddingHorizontal: gutter,
  },

  archivedNote: {
    ...type.bodySmall,
    marginBottom: spacing.md,
    color: colors.textMuted,
  },
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
}));
