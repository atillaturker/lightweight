import React from "react";
import {
  Image,
  Pressable,
  Text,
  View,
  type PressableProps,
} from "react-native";

import { svgIcon, svgToDataUri } from "@lib/svg";
import { colors } from "@theme";

import { RADIO_CHECK_SIZE, styles } from "./Radio.styles";

/** Props for {@link Radio}. */
export interface RadioProps
  extends Omit<PressableProps, "style" | "children" | "onPress"> {
  selected: boolean;
  label?: string;
  onPress?: () => void;
  disabled?: boolean;
  testID?: string;
}

/** Fixed rendered box for the check glyph — the size is not dynamic. */
const CHECK_STYLE = { width: RADIO_CHECK_SIZE, height: RADIO_CHECK_SIZE } as const;

/** The white check glyph drawn inside a selected radio. */
function CheckGlyph(): React.ReactElement {
  const uri = svgToDataUri(
    svgIcon(
      RADIO_CHECK_SIZE,
      `<path d="M20 6L9 17l-5-5" fill="none" stroke="${colors.canvas}" ` +
        'stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>',
    ),
  );

  return (
    <Image accessibilityIgnoresInvertColors source={{ uri }} style={CHECK_STYLE} />
  );
}

/**
 * Single radio option. The 22px indicator fills with the primary color
 * and a white check when selected; otherwise it is a white circle with a
 * hairline border. An optional label sits 16px to the right.
 */
export function Radio({
  selected,
  label,
  onPress,
  disabled = false,
  testID,
  ...rest
}: RadioProps): React.ReactElement {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="radio"
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      testID={testID}
      {...rest}
      style={[styles.row, disabled && styles.disabled]}
    >
      <View
        style={[
          styles.indicator,
          selected ? styles.indicatorSelected : styles.indicatorUnselected,
        ]}
        testID={testID ? `${testID}-indicator` : undefined}
      >
        {selected ? <CheckGlyph /> : null}
      </View>

      {label ? (
        <Text
          numberOfLines={1}
          style={[styles.label, disabled && styles.labelDisabled]}
        >
          {label}
        </Text>
      ) : null}
    </Pressable>
  );
}
