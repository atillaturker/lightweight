import React, { useCallback } from "react";
import { Pressable, Text, View, type PressableProps } from "react-native";

import { styles } from "./SegmentedControl.styles";

/** A single selectable segment. */
export interface SegmentedControlOption {
  value: string;
  label: string;
}

/**
 * Controlled segmented control. Exactly one `value` is active at a
 * time; pressing the active segment is a no-op, so `onChange` fires
 * only when the selection actually moves.
 *
 * Typical use: a time-range selector (4W / 12W / 6M / 1Y).
 */
export interface SegmentedControlProps
  extends Omit<PressableProps, "style" | "children" | "onPress"> {
  options: SegmentedControlOption[];
  value: string;
  onChange: (value: string) => void;
  testID?: string;
}

/** One equal-width segment — a white chip when selected. */
function Segment({
  label,
  selected,
  testID,
  onPress,
}: {
  label: string;
  selected: boolean;
  testID?: string;
  onPress: () => void;
}): React.ReactElement {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      testID={testID}
      style={[styles.segment, selected && styles.segmentSelected]}
    >
      <Text numberOfLines={1} style={[styles.label, selected && styles.labelSelected]}>
        {label}
      </Text>
    </Pressable>
  );
}

/**
 * Shared segmented control. The track uses an 8px `control` radius —
 * not pill — and the selected segment is a white chip with a hairline
 * border. All segments are equal width; there is no sliding indicator.
 */
export function SegmentedControl({
  options,
  value,
  onChange,
  testID,
  ...rest
}: SegmentedControlProps): React.ReactElement {
  const handlePress = useCallback(
    (nextValue: string) => {
      if (nextValue === value) return;

      onChange(nextValue);
    },
    [onChange, value],
  );

  return (
    <View
      accessibilityRole="radiogroup"
      style={styles.track}
      testID={testID}
      {...rest}
    >
      {options.map((option) => (
        <Segment
          key={option.value}
          label={option.label}
          onPress={() => handlePress(option.value)}
          selected={option.value === value}
          testID={testID ? `${testID}-${option.value}` : undefined}
        />
      ))}
    </View>
  );
}
