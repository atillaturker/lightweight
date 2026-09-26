import React from "react";
import { StyleSheet, View } from "react-native";

import { colors, radii } from "@theme";

/** Height of the strength bar in pixels. */
const BAR_HEIGHT = 2;

/** Props for {@link PasswordStrengthBar}. */
export interface PasswordStrengthBarProps {
  /** Strength as a fraction between 0 and 1. */
  strength: number;
  testID?: string;
}

/**
 * Neutral password strength indicator.
 *
 * A 2px track with a primary-coloured fill sized to `strength`. The fill
 * is always the primary colour — strength is communicated by width alone,
 * never by a red-to-green gradient.
 */
export function PasswordStrengthBar({
  strength,
  testID,
}: PasswordStrengthBarProps): React.ReactElement {
  const clamped = Math.min(1, Math.max(0, strength));

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}
      style={styles.track}
      testID={testID}
    >
      <View
        style={[styles.fill, { width: `${clamped * 100}%` }]}
        testID={testID ? `${testID}-fill` : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: "100%",
    height: BAR_HEIGHT,
    borderRadius: radii.control,
    backgroundColor: colors.surface,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: radii.control,
    backgroundColor: colors.primary,
  },
});
