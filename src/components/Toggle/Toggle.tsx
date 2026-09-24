import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { Animated, Pressable, type PressableProps } from "react-native";

import { colors } from "@theme";

import { KNOB_INSET, KNOB_TRAVEL, styles } from "./Toggle.styles";

/**
 * Controlled toggle switch. `value` is owned by the caller; the
 * component only reports intent through `onChange`.
 *
 * While `disabled` is true the switch is dimmed, marked disabled for
 * accessibility, and never calls `onChange`.
 */
export interface ToggleProps
  extends Omit<PressableProps, "style" | "children" | "onPress"> {
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  testID?: string;
}

/** Duration of the position/color transition, in milliseconds. */
const TRANSITION_MS = 150;

/**
 * Drives the 0→1 progress value that the track color and knob
 * position interpolate from. Mounting snaps to the current value so
 * the first paint never animates; later changes tween.
 */
function useToggleProgress(value: boolean): Animated.Value {
  const progress = useRef(new Animated.Value(value ? 1 : 0)).current;
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      progress.setValue(value ? 1 : 0);
      return;
    }

    const animation = Animated.timing(progress, {
      toValue: value ? 1 : 0,
      duration: TRANSITION_MS,
      easing: (t) => 1 - (1 - t) * (1 - t),
      useNativeDriver: false,
    });

    animation.start();

    return () => animation.stop();
  }, [progress, value]);

  return progress;
}

/**
 * The drawn switch — track plus knob. Both colors come from tokens and
 * the knob never renders a shadow.
 */
function ToggleTrack({
  progress,
}: {
  progress: Animated.Value;
}): React.ReactElement {
  const trackColor = useMemo(
    () =>
      progress.interpolate({
        inputRange: [0, 1],
        outputRange: [colors.hairline, colors.primary],
      }),
    [progress],
  );

  const knobPosition = useMemo(
    () => ({
      transform: [
        {
          translateX: progress.interpolate({
            inputRange: [0, 1],
            outputRange: [KNOB_INSET, KNOB_INSET + KNOB_TRAVEL],
          }),
        },
      ],
    }),
    [progress],
  );

  return (
    <Animated.View style={[styles.track, { backgroundColor: trackColor }]}>
      <Animated.View style={[styles.knob, knobPosition]} />
    </Animated.View>
  );
}

/**
 * Shared toggle primitive. Built from a `Pressable` and `Animated.View`
 * instead of the native `Switch`, which renders differently on iOS and
 * Android and does not match the design system.
 */
export function Toggle({
  value,
  onChange,
  disabled = false,
  testID,
  ...rest
}: ToggleProps): React.ReactElement {
  const progress = useToggleProgress(value);

  const handlePress = useCallback(() => {
    if (disabled) return;

    onChange(!value);
  }, [disabled, onChange, value]);

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      disabled={disabled}
      onPress={handlePress}
      testID={testID}
      {...rest}
      style={[styles.pressable, disabled && styles.disabled]}
    >
      <ToggleTrack progress={progress} />
    </Pressable>
  );
}
