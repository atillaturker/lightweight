import React from "react";
import { Pressable, Text, type PressableProps } from "react-native";

import { styles } from "./Pill.styles";

/** Props for {@link Pill}. */
export interface PillProps
  extends Omit<PressableProps, "style" | "children" | "onPress"> {
  label: string;
  /** Whether this chip is the active filter. */
  selected?: boolean;
  onPress?: () => void;
  testID?: string;
}

/**
 * Standalone tappable filter chip, e.g. All / Chest / Back / Legs.
 * Distinct from SegmentedControl, which sits inside a track, and from
 * Badge, which is non-interactive. No icon, no shadow.
 */
export function Pill({
  label,
  selected = false,
  onPress,
  testID,
  ...rest
}: PillProps): React.ReactElement {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      testID={testID}
      {...rest}
      style={[styles.base, selected ? styles.selected : styles.unselected]}
    >
      <Text numberOfLines={1} style={[styles.label, selected && styles.labelSelected]}>
        {label}
      </Text>
    </Pressable>
  );
}
