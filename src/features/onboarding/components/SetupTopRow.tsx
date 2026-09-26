/**
 * Setup-step top row: back chevron on the left, centered progress rail,
 * and a balancing empty slot on the right.
 *
 * The left slot is always reserved, even on step 1 where there is no back
 * target, so the rail stays optically centered. The chevron is drawn with
 * `react-native-svg` for consistent rendering on Android and iOS.
 */
import React from "react";
import { Pressable, StyleSheet, View, type ViewProps } from "react-native";
import Svg, { Path } from "react-native-svg";

import { colors, gutter } from "@theme";

import { SetupProgress, type SetupStep } from "./SetupProgress";

/** Rendered edge length of the back chevron. */
const CHEVRON_SIZE = 20;

/** Square tap target reserved for each side slot. */
const SLOT_SIZE = 44;

/** Props for {@link SetupTopRow}. */
export interface SetupTopRowProps
  extends Omit<ViewProps, "style" | "children"> {
  /** 1-based setup step to mark on the rail. */
  current: SetupStep;
  /** Called when the back chevron is pressed. Omit on step 1. */
  onBack?: () => void;
  testID?: string;
}

/** The 20px monoline back chevron. */
function BackChevron(): React.ReactElement {
  return (
    <Svg
      fill="none"
      height={CHEVRON_SIZE}
      stroke={colors.textPrimary}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      viewBox="0 0 20 20"
      width={CHEVRON_SIZE}
    >
      <Path d="M12.5 15L7.5 10L12.5 5" />
    </Svg>
  );
}

/**
 * Top row shared by the three setup steps. Renders a back chevron only
 * when `onBack` is supplied — step 1 is the start of the setup group.
 */
export function SetupTopRow({
  current,
  onBack,
  testID,
  ...rest
}: SetupTopRowProps): React.ReactElement {
  return (
    <View style={styles.container} testID={testID} {...rest}>
      {onBack ? (
        <Pressable
          accessibilityLabel="Go back"
          accessibilityRole="button"
          onPress={onBack}
          style={styles.slot}
          testID={testID ? `${testID}-back` : undefined}
        >
          <BackChevron />
        </Pressable>
      ) : (
        <View style={styles.slot} />
      )}

      <SetupProgress
        current={current}
        testID={testID ? `${testID}-progress` : undefined}
      />

      <View style={styles.slot} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: SLOT_SIZE,
    paddingHorizontal: gutter,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  slot: {
    width: SLOT_SIZE,
    height: SLOT_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
});
