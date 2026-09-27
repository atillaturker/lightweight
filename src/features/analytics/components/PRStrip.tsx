/**
 * One-line PR summary that links to History's PR filter. Moved out of
 * ProgressScreen unchanged.
 */
import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import Svg, { Path } from "react-native-svg";

import { colors, gutter, type } from "@theme";

/** PR strip geometry. */
const PR_STRIP_HEIGHT = 40;
const CHEVRON_SIZE = 16;

/** Props for {@link PRStrip}. */
export interface PRStripProps {
  count: number;
  onPress: () => void;
}

/** Single tappable row linking to the History PR filter. */
export function PRStrip({ count, onPress }: PRStripProps): React.ReactElement {
  return (
    <Pressable
      accessibilityLabel="View personal records"
      accessibilityRole="button"
      onPress={onPress}
      style={styles.prStrip}
      testID="progress-pr-strip"
    >
      <Text style={styles.prStripLabel}>{`${count} PRs this period`}</Text>
      <Svg
        fill="none"
        height={CHEVRON_SIZE}
        stroke={colors.textMuted}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        viewBox="0 0 24 24"
        width={CHEVRON_SIZE}
      >
        <Path d="M9 6l6 6-6 6" />
      </Svg>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  prStrip: {
    height: PR_STRIP_HEIGHT,
    marginHorizontal: gutter,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.hairline,
  },
  prStripLabel: { ...type.body, fontSize: 14, color: colors.textPrimary },
});
