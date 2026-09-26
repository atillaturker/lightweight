/**
 * Grouped current-vs-previous bar chart for the Progress screen.
 *
 * Each bucket draws a dark current-period bar and, when the previous period
 * has data at that position, a light previous-period bar beside it. The
 * chart has a single hairline baseline, no gridlines, no y-axis, and exactly
 * three x-axis labels. Drawn with `react-native-svg` so it renders the same
 * on both platforms.
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Line, Path, Svg, Text as SvgText } from 'react-native-svg';

import { colors } from '@theme';

import type { ProgressBucket } from '../utils';

/** Total rendered height of the chart, including the axis labels. */
export const PROGRESS_CHART_HEIGHT = 180;

/** Y of the baseline, measured from the top. */
const BASELINE_Y = 152;

/** Bar geometry, per the design spec. */
const BAR_WIDTH = 4;
const BAR_GAP = 1;
const BAR_RADIUS = 2;
const PAIR_WIDTH = BAR_WIDTH * 2 + BAR_GAP;

/** X-axis label styling. */
const AXIS_LABEL_SIZE = 11;
const AXIS_LABEL_Y = 168;

/** A rounded-top rectangle path: square at the baseline, 2px corners on top. */
function barPath(x: number, y: number, height: number): string {
  const radius = Math.min(BAR_RADIUS, BAR_WIDTH / 2, height);
  const bottom = y + height;
  return [
    `M ${x} ${bottom}`,
    `L ${x} ${y + radius}`,
    `Q ${x} ${y} ${x + radius} ${y}`,
    `L ${x + BAR_WIDTH - radius} ${y}`,
    `Q ${x + BAR_WIDTH} ${y} ${x + BAR_WIDTH} ${y + radius}`,
    `L ${x + BAR_WIDTH} ${bottom}`,
    'Z',
  ].join(' ');
}

/** Props for {@link ProgressBarChart}. */
export interface ProgressBarChartProps {
  buckets: ProgressBucket[];
  /** Indices of `buckets` that receive an x-axis label. */
  labelIndices: number[];
  /** Measured plot width in pixels. */
  width: number;
  testID?: string;
}

/**
 * Two bars per bucket on a shared baseline. A zero-height bar is skipped, so
 * a bucket with no previous-period data shows only its dark bar.
 */
export function ProgressBarChart({
  buckets,
  labelIndices,
  width,
  testID,
}: ProgressBarChartProps): React.ReactElement | null {
  if (width <= 0 || buckets.length === 0) return null;

  const groupWidth = width / buckets.length;
  const max = buckets.reduce(
    (best, bucket) => Math.max(best, bucket.current, bucket.previous),
    0,
  );
  const scale = (value: number): number =>
    max <= 0 ? 0 : (value / max) * BASELINE_Y;

  return (
    <View style={styles.container} testID={testID}>
      <Svg height={PROGRESS_CHART_HEIGHT} width={width}>
        {buckets.map((bucket, index) => {
          const pairX = index * groupWidth + (groupWidth - PAIR_WIDTH) / 2;
          const currentHeight = scale(bucket.current);
          const previousHeight = scale(bucket.previous);

          return (
            <React.Fragment key={bucket.label}>
              {previousHeight > 0 ? (
                <Path
                  d={barPath(pairX + BAR_WIDTH + BAR_GAP, BASELINE_Y - previousHeight, previousHeight)}
                  fill={colors.hairline}
                />
              ) : null}
              {currentHeight > 0 ? (
                <Path
                  d={barPath(pairX, BASELINE_Y - currentHeight, currentHeight)}
                  fill={colors.primary}
                />
              ) : null}
            </React.Fragment>
          );
        })}

        <Line
          stroke={colors.hairline}
          strokeWidth={1}
          x1={0}
          x2={width}
          y1={BASELINE_Y}
          y2={BASELINE_Y}
        />

        {labelIndices.map((index) => (
          <SvgText
            fill={colors.textMuted}
            fontSize={AXIS_LABEL_SIZE}
            fontWeight="500"
            key={`label-${index}`}
            textAnchor="middle"
            x={index * groupWidth + groupWidth / 2}
            y={AXIS_LABEL_Y}
          >
            {buckets[index].label}
          </SvgText>
        ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: PROGRESS_CHART_HEIGHT,
  },
});
