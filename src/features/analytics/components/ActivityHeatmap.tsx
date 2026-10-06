/**
 * Calendar heatmap (DESIGN.md §5.4): one column per week, Monday at the
 * top; square cells, 2px gap, 2px radius, shaded on the intensity scale.
 * Accent only outlines the selected day. Future days are not drawn.
 */
import React from "react";
import { Text, View } from "react-native";
import Svg, { Rect } from "react-native-svg";

import type { ActivityLevel } from "@domain/rules";
import { createStyles, type, useTheme, type ColorPalette } from "@theme";

import type { ActivityDay, ActivityGrid } from "../utils";

/** Gap between cells, per the design system. */
export const HEATMAP_GAP = 2;

/** Smallest cell before fewer weeks are shown. */
export const HEATMAP_MIN_CELL = 12;

/** At most a year of weeks. */
export const HEATMAP_MAX_WEEKS = 53;

const MONTH_ROW_HEIGHT = 16;

/** How many weeks fit `width` at the minimum cell size. */
export function heatmapWeeksFor(width: number): number {
  return Math.max(1, Math.min(HEATMAP_MAX_WEEKS, Math.floor((width + HEATMAP_GAP) / (HEATMAP_MIN_CELL + HEATMAP_GAP))));
}

/** Intensity step → token. */
export function intensityFill(colors: ColorPalette, level: ActivityLevel): string {
  return [colors.intensity0, colors.intensity1, colors.intensity2, colors.intensity3, colors.intensity4][level];
}

/** Props for {@link ActivityHeatmap}. */
export interface ActivityHeatmapProps {
  grid: ActivityGrid;
  width: number;
  selectedKey: string | null;
  onSelect: (day: ActivityDay | null) => void;
  accessibilityLabel: string;
  testID?: string;
}

/** The week columns with month labels above. */
export function ActivityHeatmap({
  grid,
  width,
  selectedKey,
  onSelect,
  accessibilityLabel,
  testID = "activity-heatmap",
}: ActivityHeatmapProps): React.ReactElement {
  const styles = useStyles();
  const { colors } = useTheme();
  const columns = grid.weeks.length;
  const cell = (width - (columns - 1) * HEATMAP_GAP) / columns;
  const step = cell + HEATMAP_GAP;
  const height = 7 * cell + 6 * HEATMAP_GAP;

  return (
    <View accessibilityLabel={accessibilityLabel} accessible testID={testID}>
      <View style={[styles.months, { width }]}>
        {grid.monthLabels.map(({ column, label }) => (
          <Text key={`${column}-${label}`} style={[styles.month, { left: column * step }]}>
            {label}
          </Text>
        ))}
      </View>
      <Svg height={height} width={width}>
        {grid.weeks.flatMap((week, column) =>
          week.days.map((day, row) =>
            day.future ? null : (
              <Rect
                fill={intensityFill(colors, day.level)}
                height={cell}
                key={day.key}
                onPress={() => onSelect(day.key === selectedKey ? null : day)}
                rx={2}
                stroke={day.key === selectedKey ? colors.accent : "none"}
                strokeWidth={day.key === selectedKey ? 1.5 : 0}
                testID={`${testID}-${day.key}`}
                width={cell}
                x={column * step}
                y={row * step}
              />
            ),
          ),
        )}
      </Svg>
    </View>
  );
}

const useStyles = createStyles((colors) => ({
  months: { height: MONTH_ROW_HEIGHT, position: "relative" },
  month: { ...type.caption, position: "absolute", top: 0, color: colors.textMuted },
}));
