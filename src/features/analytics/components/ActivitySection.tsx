/**
 * Progress → "Activity": the training calendar. Shows as many weeks as fit
 * the screen (up to a year); tapping a day shows its date, minutes and
 * sessions above the grid, and a Less → More legend explains the shades.
 */
import React, { useState } from "react";
import { Text, View } from "react-native";

import type { ActivityLevel } from "@domain/rules";
import { SectionHeader } from "@components/SectionHeader";
import { createStyles, spacing, type, useTheme } from "@theme";
import { formatShortDate, formatWeekdayShort } from "@lib/format";

import { useActivityGrid } from "../hooks";
import type { ActivityDay } from "../utils";
import { ActivityHeatmap, heatmapWeeksFor, intensityFill } from "./ActivityHeatmap";

const LEVELS: readonly ActivityLevel[] = [0, 1, 2, 3, 4];
const LEGEND_CELL = 10;

/** "Tue, Apr 16, 2024 · 70 min · Push, Core" or "… · Rest day". */
function dayText(day: ActivityDay): string {
  const date = `${formatWeekdayShort(day.date)}, ${formatShortDate(day.date)}`;
  if (day.minutes === 0) return `${date} · Rest day`;
  return `${date} · ${day.minutes} min · ${day.sessions.join(", ")}`;
}

/** Props for {@link ActivitySection}. */
export interface ActivitySectionProps {
  width: number;
}

/** The heatmap with its readout and legend. */
export function ActivitySection({ width }: ActivitySectionProps): React.ReactElement {
  const styles = useStyles();
  const { colors } = useTheme();
  const weeks = heatmapWeeksFor(width);
  const grid = useActivityGrid(weeks);
  const [selected, setSelected] = useState<ActivityDay | null>(null);
  const summary = `${grid.activeDays} training ${grid.activeDays === 1 ? "day" : "days"} in the last ${weeks} weeks`;

  return (
    <View testID="activity-section">
      <SectionHeader label="Activity" variant="rule" />
      <Text style={styles.readout} testID="activity-readout">
        {selected === null ? summary : dayText(selected)}
      </Text>
      <ActivityHeatmap
        accessibilityLabel={summary}
        grid={grid}
        onSelect={setSelected}
        selectedKey={selected?.key ?? null}
        width={width}
      />
      <View style={styles.legend}>
        <Text style={styles.legendLabel}>Less</Text>
        {LEVELS.map((level) => (
          <View key={level} style={[styles.legendCell, { backgroundColor: intensityFill(colors, level) }]} />
        ))}
        <Text style={styles.legendLabel}>More</Text>
      </View>
    </View>
  );
}

const useStyles = createStyles((colors) => ({
  readout: {
    ...type.label,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    fontVariant: ["tabular-nums"],
    color: colors.textPrimary,
  },
  legend: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  legendLabel: { ...type.caption, color: colors.textMuted },
  legendCell: { width: LEGEND_CELL, height: LEGEND_CELL, borderRadius: 2 },
}));
