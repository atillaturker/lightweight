/**
 * One card of the welcome carousel: a caption row over an 8-week
 * estimated-1RM line chart.
 *
 * Per the welcome spec the chart is monochrome — no accent, no state
 * colors — so it reads as product evidence rather than a call to action.
 * It is drawn with `react-native-svg` so it renders identically on both
 * platforms. The component is not exported from the feature barrel; only
 * the carousel uses it.
 */
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Circle, Line, Polyline, Svg, Text as SvgText } from "react-native-svg";

import { colors, spacing } from "@theme";

import {
  WELCOME_CHART_CARD_WIDTH,
  WELCOME_CHART_GRID_Y,
  WELCOME_CHART_POINT_X,
  WELCOME_CHART_SIZE,
  WELCOME_CHART_X_TICKS,
  type WelcomeChartSeries,
} from "./welcomeChartSeries";

/** Rendered height of the chart box, matching the SVG viewBox. */
const CHART_HEIGHT = WELCOME_CHART_SIZE.height;

/** Fill of the 2px vertex dots and the trend line. */
const SERIES_COLOR = colors.chartLine;

/** Fill of the week labels and the y-axis values. */
const AXIS_COLOR = colors.textMuted;

/** SVG text needs plain numbers, not RN style objects. */
const AXIS_LABEL_SIZE = 10;
const VALUE_SIZE = 14;
const CAPTION_SIZE = 11;

/** Y offset that places an axis label on its gridline. */
const Y_LABEL_BASELINE = 3;

/** X offset of the right-aligned y-axis labels. */
const Y_LABEL_X = 22;

/** Y baseline of the week labels below the plot. */
const X_LABEL_Y = 132;

/** Chart box passed to Svg; width is intrinsic, not fluid. */
const CHART_STYLE = {
  width: WELCOME_CHART_CARD_WIDTH,
  height: CHART_HEIGHT,
  marginTop: spacing.md,
} as const;

/** Props for {@link WelcomeChartCard}. */
export interface WelcomeChartCardProps {
  series: WelcomeChartSeries;
}

/**
 * A single chart card. The polyline joins the eight weekly points, and
 * every vertex gets a small filled dot so the series reads as measured
 * data rather than a stylised trend.
 */
export function WelcomeChartCard({
  series,
}: WelcomeChartCardProps): React.ReactElement {
  const points = WELCOME_CHART_POINT_X.map(
    (x, index) => `${x},${series.points[index]}`,
  ).join(" ");

  return (
    <View style={styles.card}>
      <View style={styles.captionRow}>
        <Text numberOfLines={1} style={styles.caption}>
          {series.caption}
        </Text>
        <Text style={styles.value}>{series.value}</Text>
      </View>

      <Svg
        fill="none"
        height={CHART_HEIGHT}
        style={CHART_STYLE}
        viewBox={`0 0 ${WELCOME_CHART_SIZE.width} ${CHART_HEIGHT}`}
      >
        {WELCOME_CHART_GRID_Y.map((y, index) => (
          <React.Fragment key={y}>
            <Line
              stroke={colors.chartGrid}
              strokeWidth={1}
              x1={Y_LABEL_X + 6}
              x2={WELCOME_CHART_SIZE.width}
              y1={y}
              y2={y}
            />
            <SvgText
              fill={AXIS_COLOR}
              fontSize={AXIS_LABEL_SIZE}
              fontWeight="500"
              textAnchor="end"
              x={Y_LABEL_X}
              y={y + Y_LABEL_BASELINE}
            >
              {series.yLabels[index]}
            </SvgText>
          </React.Fragment>
        ))}

        <Polyline
          fill="none"
          points={points}
          stroke={SERIES_COLOR}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
        />

        {WELCOME_CHART_POINT_X.map((x, index) => (
          <Circle
            cx={x}
            cy={series.points[index]}
            fill={SERIES_COLOR}
            key={x}
            r={2}
          />
        ))}

        {WELCOME_CHART_X_TICKS.map((tick) => (
          <SvgText
            fill={AXIS_COLOR}
            fontSize={AXIS_LABEL_SIZE}
            fontWeight="500"
            key={tick.label}
            textAnchor="middle"
            x={tick.x}
            y={X_LABEL_Y}
          >
            {tick.label}
          </SvgText>
        ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: WELCOME_CHART_CARD_WIDTH,
  },
  captionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  caption: {
    flexShrink: 1,
    fontFamily: "Inter-Medium",
    fontSize: CAPTION_SIZE,
    letterSpacing: 0.66,
    textTransform: "uppercase",
    color: colors.textMuted,
  },
  value: {
    fontFamily: "Inter-SemiBold",
    fontSize: VALUE_SIZE,
    fontVariant: ["tabular-nums"],
    color: colors.textPrimary,
  },
});
