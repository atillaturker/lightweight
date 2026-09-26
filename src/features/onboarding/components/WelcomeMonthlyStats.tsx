/**
 * "THIS MONTH" stat row for the Welcome screen: a goal-completion ring
 * beside a miniature weekly-volume bar chart.
 *
 * Both blocks are illustrative product evidence — the ring previews the
 * weekly-frequency goal and the bars preview the volume analytics. The
 * row sits directly on the white canvas: no card, no border, no fill.
 * Bars are plain views because the chart is static — there is nothing
 * to interact with and no data to bind.
 */
import React from "react";
import { Text, View } from "react-native";

import { RingChart } from "@components/RingChart";

import {
  BAR_PLOT_HEIGHT,
  styles,
} from "./WelcomeMonthlyStats.styles";
import {
  WELCOME_GOAL_LABEL,
  WELCOME_GOAL_MAX,
  WELCOME_GOAL_SUBLABEL,
  WELCOME_GOAL_VALUE,
  WELCOME_VOLUME_BARS,
  WELCOME_VOLUME_TOTAL,
  type WelcomeVolumeBar,
} from "./welcomeStatSeries";

/** Ring diameter for the preview — a hero ring, so a 4px stroke. */
const RING_SIZE = 88;

/** X-axis ticks rendered under the bars, left to right. */
const AXIS_TICKS: readonly string[] = ["W1", "W4", "W8"];

/**
 * One volume bar, sized as a fraction of the plot height. Dynamic
 * height is the only inline style — everything else is static.
 */
function VolumeBar({ bar }: { bar: WelcomeVolumeBar }): React.ReactElement {
  return (
    <View
      accessibilityLabel={bar.label}
      style={[styles.bar, { height: BAR_PLOT_HEIGHT * bar.fraction }]}
    />
  );
}

/**
 * The monthly preview row. The ring is `colors.primary` because this is
 * a preview rather than a live state — the accent color stays off the
 * Welcome screen entirely.
 */
export function WelcomeMonthlyStats(): React.ReactElement {
  return (
    <View style={styles.row} testID="welcome-monthly-stats">
      <View style={styles.ringBlock}>
        <RingChart
          centerLabel={WELCOME_GOAL_LABEL}
          centerSublabel={WELCOME_GOAL_SUBLABEL}
          max={WELCOME_GOAL_MAX}
          size={RING_SIZE}
          testID="welcome-goal-ring"
          value={WELCOME_GOAL_VALUE}
        />
      </View>

      <View style={styles.chartBlock}>
        <View style={styles.labelRow}>
          <Text style={styles.labelCaption}>Weekly volume</Text>
          <Text style={styles.labelValue}>{WELCOME_VOLUME_TOTAL}</Text>
        </View>

        <View style={styles.plot}>
          {WELCOME_VOLUME_BARS.map((bar) => (
            <VolumeBar bar={bar} key={bar.label} />
          ))}
        </View>

        <View style={styles.axisRow}>
          {AXIS_TICKS.map((tick) => (
            <Text key={tick} style={styles.axisLabel}>
              {tick}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
}
