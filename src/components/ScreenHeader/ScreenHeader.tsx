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

import {
  HEADER_CHEVRON_SIZE,
  styles,
} from "./ScreenHeader.styles";

/** Props for {@link ScreenHeader}. */
export interface ScreenHeaderProps
  extends Omit<PressableProps, "style" | "children" | "onPress"> {
  /** Centered title. Callers must supply a single-line, pre-shortened string. */
  title?: string;
  /** Called when the back chevron is pressed. */
  onBack?: () => void;
  /** Whether to render the back chevron in the left slot. */
  showBack?: boolean;
  /** Trailing element rendered in the right slot. */
  rightAction?: React.ReactNode;
  testID?: string;
}

/** Fixed rendered box for the back glyph — the size is not dynamic. */
const CHEVRON_STYLE = {
  width: HEADER_CHEVRON_SIZE,
  height: HEADER_CHEVRON_SIZE,
} as const;

/**
 * The 20px monoline chevron used by the back target, drawn as an SVG
 * data URI so no native SVG view is required.
 */
function BackChevron(): React.ReactElement {
  const uri = svgToDataUri(
    svgIcon(
      HEADER_CHEVRON_SIZE,
      `<path d="M15 18l-6-6 6-6" fill="none" stroke="${colors.textPrimary}" ` +
        'stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/>',
    ),
  );

  return (
    <Image accessibilityIgnoresInvertColors source={{ uri }} style={CHEVRON_STYLE} />
  );
}

/**
 * Stack-screen header. A three-slot flex row — left back target, centered
 * title, right action — that keeps the title truly centered regardless of
 * which slots are filled.
 *
 * Typical use: the top bar of every pushed screen. There is no bottom
 * border and no background change on scroll.
 */
export function ScreenHeader({
  title,
  onBack,
  showBack = false,
  rightAction,
  testID,
  ...rest
}: ScreenHeaderProps): React.ReactElement {
  return (
    <View style={styles.container} testID={testID} {...rest}>
      {showBack ? (
        <Pressable
          accessibilityLabel="Go back"
          accessibilityRole="button"
          onPress={onBack}
          style={styles.back}
          testID={testID ? `${testID}-back` : undefined}
        >
          <BackChevron />
        </Pressable>
      ) : (
        <View style={styles.slot} />
      )}

      {title ? (
        <Text numberOfLines={1} style={styles.title}>
          {title}
        </Text>
      ) : (
        <View style={styles.titleSpacer} />
      )}

      {rightAction ? (
        <View style={styles.slot}>{rightAction}</View>
      ) : (
        <View style={styles.slot} />
      )}
    </View>
  );
}
