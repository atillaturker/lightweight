/**
 * Three-bar progress indicator for the onboarding setup steps.
 *
 * Exactly one bar is filled at a time — the current step. Completed steps
 * return to the hairline color; they are never left black, and no bar is
 * ever colored with the accent. There is no label and no step counter.
 */
import React from "react";
import { StyleSheet, View, type ViewProps } from "react-native";

import { colors, radii } from "@theme";

/** The three ordered setup steps, in flow order. */
export const SETUP_STEPS = [1, 2, 3] as const;

/** Which setup step the indicator is marking. */
export type SetupStep = (typeof SETUP_STEPS)[number];

/** Rendered width of one bar. */
const BAR_WIDTH = 24;

/** Rendered height of one bar. */
const BAR_HEIGHT = 3;

/** Vertical gap between bars. */
const BAR_GAP = 4;

/** Props for {@link SetupProgress}. */
export interface SetupProgressProps
  extends Omit<ViewProps, "style" | "children"> {
  /** 1-based setup step that should be the only filled bar. */
  current: SetupStep;
  testID?: string;
}

/**
 * Centered progress rail for a setup step. Renders three pills; the one
 * matching `current` is primary, the others are hairline.
 */
export function SetupProgress({
  current,
  testID,
  ...rest
}: SetupProgressProps): React.ReactElement {
  return (
    <View
      accessibilityLabel={`Step ${current} of ${SETUP_STEPS.length}`}
      accessibilityRole="progressbar"
      accessibilityValue={{
        min: 1,
        max: SETUP_STEPS.length,
        now: current,
      }}
      style={styles.container}
      testID={testID}
      {...rest}
    >
      {SETUP_STEPS.map((step) => (
        <View
          key={step}
          style={[styles.bar, step === current ? styles.barCurrent : null]}
          testID={testID ? `${testID}-bar-${step}` : undefined}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: BAR_GAP,
  },
  bar: {
    width: BAR_WIDTH,
    height: BAR_HEIGHT,
    borderRadius: radii.control,
    backgroundColor: colors.hairline,
  },
  barCurrent: {
    backgroundColor: colors.primary,
  },
});
