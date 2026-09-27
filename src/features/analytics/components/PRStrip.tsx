/**
 * One-line PR summary that links to History's PR filter. A single-row Card
 * (v3 rule 1) led by the trophy glyph, which marks the row as records
 * rather than one more metric (v3 rule 6).
 */
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";

import { Card } from "@components/Card";
import { LineIcon } from "@components/LineIcon";
import { colors, gutter, spacing, type } from "@theme";

/** PR strip geometry. */
const PR_STRIP_HEIGHT = 40;
const CHEVRON_SIZE = 16;
const ROW_ICON_SIZE = 20;

/** Props for {@link PRStrip}. */
export interface PRStripProps {
  count: number;
  onPress: () => void;
}

/** Single tappable row linking to the History PR filter. */
export function PRStrip({ count, onPress }: PRStripProps): React.ReactElement {
  return (
    <View style={styles.wrap}>
      <Card>
        <Pressable
          accessibilityLabel="View personal records"
          accessibilityRole="button"
          onPress={onPress}
          style={styles.prStrip}
          testID="progress-pr-strip"
        >
          <LineIcon
            color={colors.textPrimary}
            name="trophy"
            size={ROW_ICON_SIZE}
          />
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
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginHorizontal: gutter },
  prStrip: {
    height: PR_STRIP_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  prStripLabel: {
    ...type.body,
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
  },
});
