import React from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { colors } from "@theme";

import {
  hitSlop,
  labelStyles,
  pressedStyles,
  styles,
  variantStyles,
} from "./Button.styles";

/**
 * Button variants:
 * - `primary` — black fill, inverse label, 52px. Exactly one per screen.
 * - `secondary` — white fill with a 1px hairline border, 52px.
 * - `text` — label only, no fill or border, 44px.
 *
 * The `disabled` prop exists for edge cases only. Auth and onboarding
 * primary actions must never be disabled — validation runs on submit.
 */
export interface ButtonProps {
  variant?: "primary" | "secondary" | "text";
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  testID?: string;
}

/**
 * Shared button primitive. Never renders a shadow or a gradient.
 *
 * While `loading` is true the label stays in the layout (invisible) so
 * the button keeps its measured size, and an ActivityIndicator is drawn
 * centered over the label. The button is not pressable while loading or
 * disabled.
 */
export function Button({
  variant = "primary",
  label,
  onPress,
  loading = false,
  disabled = false,
  icon,
  fullWidth = false,
  testID,
}: ButtonProps): React.ReactElement {
  const isInactive = disabled || loading;
  const spinnerColor =
    variant === "primary" ? colors.textInverse : colors.textPrimary;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled, busy: loading }}
      disabled={isInactive}
      hitSlop={hitSlop}
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [
        styles.base,
        variantStyles[variant],
        fullWidth && styles.fullWidth,
        pressed && !isInactive && pressedStyles[variant],
        disabled && styles.disabled,
      ]}
    >
      {icon ? <View style={styles.icon}>{icon}</View> : null}

      <Text
        numberOfLines={1}
        style={[labelStyles[variant], loading && styles.labelHidden]}
      >
        {label}
      </Text>

      {loading ? (
        <View pointerEvents="none" style={styles.loader}>
          <ActivityIndicator
            color={spinnerColor}
            size={16}
            testID={testID ? `${testID}-loading` : undefined}
          />
        </View>
      ) : null}
    </Pressable>
  );
}
