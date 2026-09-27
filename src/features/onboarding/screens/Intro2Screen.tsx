/**
 * Pre-auth intro step 2 — "See your progress."
 *
 * Same structure as the first intro, with a hero metric and a line chart
 * as the product fragment. The chart is drawn with `react-native-svg` so
 * the accent dot renders identically on both platforms. It is the only
 * place in the intro where the accent color appears, and only as the
 * single latest data point.
 */
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Circle, Line, Path, Svg } from "react-native-svg";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { Button } from "@components/Button";
import { colors, fineSpacing, spacing } from "@theme";

import type { IntroStackParamList } from "@/app/navigation/types";
import { useAppStore } from "../store/appStore";
import { styles } from "./onboardingScreen.styles";

type Props = NativeStackScreenProps<IntroStackParamList, "Intro2">;

/** Intrinsic chart geometry; the rendered box is scaled to the column. */
const CHART_WIDTH = 350;
const CHART_HEIGHT = 110;

/** Latest-value marker in the chart. */
const DOT_RADIUS = 3;

/**
 * The trend polyline. A gentle monotonic rise from the left baseline to
 * the latest value at the right edge.
 */
const TREND_PATH =
  "M 0 92 C 55 90, 85 80, 140 68 C 190 58, 235 44, 275 30 C 295 24, 310 16, 322 10";

/** Y gridlines: the value, its baseline. */
const GRID_LINES = [18, 62, 96] as const;

/** Coordinates of the highlighted latest data point. */
const LATEST_POINT = { x: 322, y: 10 } as const;

/** Rendered size of the 110px-tall chart box. */
const CHART_STYLE = { width: "100%", height: CHART_HEIGHT } as const;

/** The hero metric and chart previewed on the second intro screen. */
function ProgressFragment(): React.ReactElement {
  return (
    <View style={styles.fragment}>
      <Text style={fragmentStyles.metricLabel}>Estimated 1RM</Text>

      <View style={fragmentStyles.metricRow}>
        <Text style={fragmentStyles.metricValue}>102.5</Text>
        <Text style={fragmentStyles.metricUnit}>kg</Text>
      </View>

      <Text style={fragmentStyles.delta}>▲ 4.2 kg over 8 weeks</Text>

      <View style={fragmentStyles.chart}>
        <Svg
          height={CHART_HEIGHT}
          style={CHART_STYLE}
          viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
        >
          {GRID_LINES.map((y) => (
            <Line
              key={y}
              stroke={colors.chartGrid}
              strokeWidth={1}
              x1={0}
              x2={CHART_WIDTH}
              y1={y}
              y2={y}
            />
          ))}

          <Path
            d={TREND_PATH}
            fill="none"
            stroke={colors.chartLine}
            strokeLinecap="round"
            strokeWidth={1.5}
          />

          <Circle
            cx={LATEST_POINT.x}
            cy={LATEST_POINT.y}
            fill={colors.chartHighlight}
            r={DOT_RADIUS}
            stroke={colors.canvas}
            strokeWidth={1}
          />
        </Svg>

        <View style={fragmentStyles.axisRow}>
          <Text style={fragmentStyles.axisLabel}>W1</Text>
          <Text style={fragmentStyles.axisLabel}>W8</Text>
        </View>
      </View>

      <Text style={fragmentStyles.caption}>Bench Press · last 8 weeks</Text>
    </View>
  );
}

/**
 * Second intro screen. Pushed from the first, so it shows no back
 * chevron. Both "Skip" and the primary CTA mark the intro as seen and
 * hand control back to the root navigator, which mounts AuthStack.
 */
export function Intro2Screen(_props: Props): React.ReactElement {
  const markIntroSeen = useAppStore((state) => state.markIntroSeen);

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.topSlot} />
        <Pressable
          accessibilityLabel="Skip onboarding"
          accessibilityRole="button"
          onPress={markIntroSeen}
          testID="intro2-skip"
        >
          <Text style={styles.skipLabel}>Skip</Text>
        </Pressable>
      </View>

      <View style={styles.introBody}>
        <Text style={styles.introHeadline}>See your progress.</Text>
        <Text style={styles.introSupporting}>
          Turn every session into clear trends, personal records and
          strength curves.
        </Text>

        <ProgressFragment />
      </View>

      <View style={styles.footer}>
        <Button
          fullWidth
          label="Continue"
          onPress={markIntroSeen}
          testID="intro2-continue"
        />
      </View>
    </SafeAreaView>
  );
}

const fragmentStyles = StyleSheet.create({
  metricLabel: {
    fontFamily: "Inter-Medium",
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: colors.textMuted,
  },
  metricRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: fineSpacing.tight,
  },
  metricValue: {
    fontFamily: "Inter-SemiBold",
    fontSize: 34,
    lineHeight: 38,
    letterSpacing: -1,
    fontVariant: ["tabular-nums"],
    color: colors.textPrimary,
  },
  metricUnit: {
    fontFamily: "Inter-Medium",
    fontSize: 16,
    marginLeft: spacing.xs,
    color: colors.textMuted,
  },
  delta: {
    fontFamily: "Inter-Medium",
    fontSize: 13,
    marginTop: spacing.sm,
    color: colors.success,
  },
  chart: {
    marginTop: spacing.xxl,
  },
  axisRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: fineSpacing.tight,
  },
  axisLabel: {
    fontFamily: "Inter-Medium",
    fontSize: 11,
    color: colors.textMuted,
  },
  caption: {
    fontFamily: "Inter-Regular",
    fontSize: 12,
    marginTop: spacing.md,
    color: colors.textMuted,
  },
});
