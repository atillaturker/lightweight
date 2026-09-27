import React from "react";
import { View, type ViewProps } from "react-native";
import Svg, { Path } from "react-native-svg";

import { colors } from "@theme";

/** Height of the sparkline, per v3 rule 7. */
export const SPARKLINE_HEIGHT = 30;

/** Stroke width of the line. */
const STROKE_WIDTH = 1.5;

/** Props for {@link TrendSparkline}. */
export interface TrendSparklineProps extends Omit<ViewProps, "style" | "children"> {
  /** Series in chronological order. `null` marks a gap and is skipped. */
  points: readonly (number | null)[];
  /** Rendered width in px. */
  width: number;
  testID?: string;
}

/**
 * SVG path for a series scaled into a `width` × `height` box, inset by
 * half the stroke so the line is never clipped. Returns `null` when fewer
 * than two values are present — one point is not a trend.
 */
export function calculateSparklinePath(
  points: readonly (number | null)[],
  width: number,
  height: number,
): string | null {
  const indexed = points
    .map((value, index) => ({ value, index }))
    .filter(
      (entry): entry is { value: number; index: number } =>
        entry.value !== null && Number.isFinite(entry.value),
    );
  if (indexed.length < 2 || points.length < 2) return null;

  const inset = STROKE_WIDTH / 2;
  const values = indexed.map((entry) => entry.value);
  const min = Math.min(...values);
  const span = Math.max(...values) - min;
  const stepX = (width - inset * 2) / (points.length - 1);
  const usableY = height - inset * 2;

  return indexed
    .map(({ value, index }, order) => {
      const x = inset + index * stepX;
      // A flat series sits on the vertical middle rather than the floor.
      const y = span === 0 ? height / 2 : inset + usableY * (1 - (value - min) / span);
      return `${order === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

/**
 * Hero-metric decoration ("Design enrichment v3", rule 7): a 30px-tall,
 * 1.5px `colors.primary` line with no axis, gridlines, fill or highlight.
 * Renders an empty box of the same size when there is no trend to draw,
 * so the hero layout does not jump.
 */
export function TrendSparkline({
  points,
  width,
  testID,
  ...rest
}: TrendSparklineProps): React.ReactElement {
  const path = calculateSparklinePath(points, width, SPARKLINE_HEIGHT);

  return (
    <View
      style={{ width, height: SPARKLINE_HEIGHT }}
      testID={testID}
      {...rest}
    >
      {path !== null ? (
        <Svg
          fill="none"
          height={SPARKLINE_HEIGHT}
          stroke={colors.primary}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={STROKE_WIDTH}
          testID={testID ? `${testID}-line` : undefined}
          viewBox={`0 0 ${width} ${SPARKLINE_HEIGHT}`}
          width={width}
        >
          <Path d={path} />
        </Svg>
      ) : null}
    </View>
  );
}
