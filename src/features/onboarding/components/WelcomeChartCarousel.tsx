/**
 * Full-bleed carousel of the four product-data preview charts.
 *
 * The track scrolls on the horizontal axis only and snaps card-to-card,
 * which keeps the "there is more" affordance honest without pagination
 * dots, arrows or autoplay. Cards sit directly on the canvas — the
 * carousel draws no surface, border or shadow of its own.
 */
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { gutter, spacing } from "@theme";

import { WelcomeChartCard } from "./WelcomeChartCard";
import {
  WELCOME_CHART_CARD_WIDTH,
  WELCOME_CHART_SERIES,
} from "./welcomeChartSeries";

/** Distance between two cards. */
const CARD_GAP = spacing.md;

/**
 * The product-data preview. Height is intrinsic — the tallest card
 * decides it — so the section does not reserve dead space.
 */
export function WelcomeChartCarousel(): React.ReactElement {
  return (
    <ScrollView
      contentContainerStyle={styles.track}
      decelerationRate="fast"
      horizontal
      showsHorizontalScrollIndicator={false}
      snapToInterval={WELCOME_CHART_CARD_WIDTH + CARD_GAP}
      testID="welcome-chart-carousel"
    >
      {WELCOME_CHART_SERIES.map((series) => (
        <View key={series.caption} style={styles.slot}>
          <WelcomeChartCard series={series} />
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  track: {
    paddingHorizontal: gutter,
    alignItems: "flex-start",
  },
  slot: {
    marginRight: CARD_GAP,
  },
});
