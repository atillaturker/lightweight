/**
 * Single-series weekly line chart for the Exercise Detail screen.
 *
 * Eight weekly points on three hairline gridlines, with two x-axis labels
 * and the latest point ringed in the accent color. Gaps (weeks with no data)
 * break the line rather than interpolating across them. Drawn with
 * `react-native-svg`; a single point renders as a lone dot.
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Circle, Line, Path, Svg, Text as SvgText } from 'react-native-svg';

import { colors } from '@theme';

/** Total rendered height, including the x-axis labels. */
export const EXERCISE_CHART_HEIGHT = 180;

/** Plot geometry. */
const BASELINE_Y = 150;
const TOP_Y = 14;
const PLOT_LEFT = 40;
const GRID_STROKE = 1;
const LINE_STROKE = 1.5;
const DOT_RADIUS = 2;
const LATEST_RADIUS = 3;
const AXIS_LABEL_SIZE = 11;
const AXIS_LABEL_Y = 168;
const Y_LABEL_GAP = 6;

/** One plotted vertex. */
interface Vertex {
  x: number;
  y: number;
}

/** Smooth path through contiguous vertices, using midpoint quadratics. */
function smoothPath(vertices: Vertex[]): string {
  if (vertices.length === 0) return '';
  if (vertices.length === 1) {
    return `M ${vertices[0].x} ${vertices[0].y}`;
  }

  let path = `M ${vertices[0].x} ${vertices[0].y}`;
  for (let index = 1; index < vertices.length - 1; index += 1) {
    const current = vertices[index];
    const next = vertices[index + 1];
    const midX = (current.x + next.x) / 2;
    const midY = (current.y + next.y) / 2;
    path += ` Q ${current.x} ${current.y} ${midX} ${midY}`;
  }
  const last = vertices[vertices.length - 1];
  path += ` L ${last.x} ${last.y}`;
  return path;
}

/** Props for {@link ExerciseLineChart}. */
export interface ExerciseLineChartProps {
  /** One value per week; `null` for weeks without data. */
  points: (number | null)[];
  /** Measured plot width in pixels. */
  width: number;
  /** Formats a value for the y-axis labels. */
  formatValue: (value: number) => string;
  testID?: string;
}

/**
 * The weekly series. Returns `null` when there is nothing to plot, so the
 * screen can show its "not enough data" message instead.
 */
export function ExerciseLineChart({
  points,
  width,
  formatValue,
  testID,
}: ExerciseLineChartProps): React.ReactElement | null {
  const values = points.filter((value): value is number => value !== null);
  if (width <= 0 || values.length === 0) return null;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min;
  const plotWidth = width - PLOT_LEFT;
  const step = points.length > 1 ? plotWidth / (points.length - 1) : 0;

  const xOf = (index: number): number =>
    points.length > 1 ? PLOT_LEFT + index * step : PLOT_LEFT + plotWidth / 2;
  const yOf = (value: number): number =>
    span === 0
      ? (TOP_Y + BASELINE_Y) / 2
      : BASELINE_Y - ((value - min) / span) * (BASELINE_Y - TOP_Y);

  const vertices: (Vertex | null)[] = points.map((value, index) =>
    value === null ? null : { x: xOf(index), y: yOf(value) },
  );

  const runs: Vertex[][] = [];
  let run: Vertex[] = [];
  for (const vertex of vertices) {
    if (vertex === null) {
      if (run.length > 0) runs.push(run);
      run = [];
    } else {
      run.push(vertex);
    }
  }
  if (run.length > 0) runs.push(run);

  const latestIndex = points.reduce<number>(
    (best, value, index) => (value !== null ? index : best),
    -1,
  );
  const gridY = [TOP_Y, (TOP_Y + BASELINE_Y) / 2, BASELINE_Y];
  const gridValues = [max, (max + min) / 2, min];

  return (
    <View style={styles.container} testID={testID}>
      <Svg height={EXERCISE_CHART_HEIGHT} width={width}>
        {gridY.map((y, index) => (
          <React.Fragment key={`grid-${index}`}>
            <Line
              stroke={colors.hairline}
              strokeWidth={GRID_STROKE}
              x1={PLOT_LEFT}
              x2={width}
              y1={y}
              y2={y}
            />
            <SvgText
              fill={colors.textMuted}
              fontSize={AXIS_LABEL_SIZE}
              fontWeight="500"
              textAnchor="end"
              x={PLOT_LEFT - Y_LABEL_GAP}
              y={y + AXIS_LABEL_SIZE / 3}
            >
              {formatValue(gridValues[index])}
            </SvgText>
          </React.Fragment>
        ))}

        {runs.map((verticesRun, index) =>
          verticesRun.length > 1 ? (
            <Path
              d={smoothPath(verticesRun)}
              fill="none"
              key={`run-${index}`}
              stroke={colors.primary}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={LINE_STROKE}
            />
          ) : null,
        )}

        {vertices.map((vertex, index) =>
          vertex === null || index === latestIndex ? null : (
            <Circle
              cx={vertex.x}
              cy={vertex.y}
              fill={colors.primary}
              key={`dot-${index}`}
              r={DOT_RADIUS}
            />
          ),
        )}

        {latestIndex >= 0 && vertices[latestIndex] !== null ? (
          <Circle
            cx={vertices[latestIndex]!.x}
            cy={vertices[latestIndex]!.y}
            fill={colors.accent}
            r={LATEST_RADIUS}
            stroke={colors.canvas}
            strokeWidth={1}
          />
        ) : null}

        <SvgText
          fill={colors.textMuted}
          fontSize={AXIS_LABEL_SIZE}
          fontWeight="500"
          textAnchor="start"
          x={PLOT_LEFT}
          y={AXIS_LABEL_Y}
        >
          W1
        </SvgText>
        <SvgText
          fill={colors.textMuted}
          fontSize={AXIS_LABEL_SIZE}
          fontWeight="500"
          textAnchor="end"
          x={width}
          y={AXIS_LABEL_Y}
        >
          W8
        </SvgText>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: EXERCISE_CHART_HEIGHT,
  },
});
