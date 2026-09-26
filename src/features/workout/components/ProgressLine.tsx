/**
 * Thin progress indicators for the training loop.
 *
 * Both bars are presentation-only and take their fill as a `0–1` ratio, so
 * callers never compute pixel widths in JSX. Neither is an overlay: the
 * session bar sits under the header and the rest bar sits under the
 * session bar, per the design system's "never an overlay" rule.
 */
import React from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';

import { colors } from '@theme';

/** Height of the full-bleed session progress bar. */
export const SESSION_BAR_HEIGHT = 2;

/** Height of the rest-timer line. */
export const REST_BAR_HEIGHT = 2;

/** Props for {@link ProgressLine}. */
export interface ProgressLineProps extends Omit<ViewProps, 'style' | 'children'> {
  /** Filled fraction of the track, clamped to 0–1. */
  ratio: number;
  /** Color of the filled portion. Defaults to `colors.primary`. */
  fillColor?: string;
  testID?: string;
}

/** Clamp a ratio into the drawable 0–1 range. */
export function clampRatio(ratio: number): number {
  if (!Number.isFinite(ratio) || ratio <= 0) return 0;
  return Math.min(ratio, 1);
}

/**
 * Full-bleed 2px progress line: hairline track, primary fill. Used for
 * session completion and, at a partial ratio, for the rest timer.
 */
export function ProgressLine({
  ratio,
  fillColor = colors.primary,
  testID,
  ...rest
}: ProgressLineProps): React.ReactElement {
  return (
    <View
      accessibilityRole="progressbar"
      style={styles.track}
      testID={testID}
      {...rest}
    >
      <View
        style={[
          styles.fill,
          { backgroundColor: fillColor, width: `${clampRatio(ratio) * 100}%` },
        ]}
        testID={testID ? `${testID}-fill` : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: SESSION_BAR_HEIGHT,
    backgroundColor: colors.hairline,
  },
  fill: {
    height: SESSION_BAR_HEIGHT,
  },
});
