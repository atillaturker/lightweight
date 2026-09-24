import React from "react";
import { Text, View, type ViewProps } from "react-native";

import { styles } from "./Badge.styles";

/**
 * Badge variants:
 * - `neutral` — surface fill, 1px hairline border, primary text.
 * - `pr` — identical to `neutral`. The word "PR" is the only signal;
 *   no accent color is introduced.
 */
export interface BadgeProps extends Omit<ViewProps, "style" | "children"> {
  label: string;
  variant?: "neutral" | "pr";
  testID?: string;
}

/**
 * Small pill label used for PR markers and status tags. Renders no
 * shadow, icon, dot, or numeric value — the pill and its text carry
 * the whole meaning.
 */
export function Badge({
  label,
  variant = "neutral",
  testID,
  ...rest
}: BadgeProps): React.ReactElement {
  return (
    <View
      accessibilityLabel={label}
      style={styles.base}
      testID={testID}
      {...rest}
    >
      <Text numberOfLines={1} style={styles.label}>
        {label}
      </Text>
    </View>
  );
}
