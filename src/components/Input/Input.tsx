import React, { useCallback, useState } from "react";
import { Text, TextInput, View, type TextInputProps } from "react-native";

import { styles } from "./Input.styles";

/**
 * Input variants/states:
 * - default — white fill, 1px hairline border, 52px.
 * - focused — border turns `#111111`. No glow ring, no shadow.
 * - error — border turns to the error state color, one inline message.
 * - disabled — reduced opacity and not editable.
 *
 * `...rest` is spread onto the underlying `TextInput`, so `value`,
 * `onChangeText`, `keyboardType`, `secureTextEntry`, etc. all pass
 * through unchanged.
 */
export interface InputProps extends Omit<TextInputProps, "style"> {
  /** Field label rendered above the input. */
  label?: string;
  /** Inline error message. Replaces `helperText` when present. */
  error?: string;
  /** Supporting text rendered under the input when there is no error. */
  helperText?: string;
  /** Dims the field and blocks editing. */
  editable?: boolean;
  /**
   * Right-aligned, vertically centered node drawn over the field, e.g. a
   * password reveal control. When present the text input reserves extra
   * right padding so typed text never renders beneath it.
   */
  rightAccessory?: React.ReactNode;
  testID?: string;
}

/**
 * Shared single-line input primitive. Never renders a shadow, glow,
 * or gradient — state is expressed through the 1px border only.
 */
export function Input({
  label,
  error,
  helperText,
  editable = true,
  rightAccessory,
  testID,
  onFocus,
  onBlur,
  ...rest
}: InputProps): React.ReactElement {
  const [focused, setFocused] = useState(false);

  const handleFocus = useCallback<NonNullable<TextInputProps["onFocus"]>>(
    (event) => {
      setFocused(true);
      onFocus?.(event);
    },
    [onFocus],
  );

  const handleBlur = useCallback<NonNullable<TextInputProps["onBlur"]>>(
    (event) => {
      setFocused(false);
      onBlur?.(event);
    },
    [onBlur],
  );

  const message = error ?? helperText;
  const hasError = Boolean(error);
  const accessibilityLabel = label ?? rest.placeholder;

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <View style={styles.fieldWrap}>
        <TextInput
          {...rest}
          accessibilityLabel={accessibilityLabel}
          aria-invalid={hasError || undefined}
          editable={editable}
          onBlur={handleBlur}
          onFocus={handleFocus}
          testID={testID}
          style={[
            styles.field,
            Boolean(rightAccessory) && styles.fieldWithAccessory,
            focused && editable && styles.focused,
            hasError && styles.errored,
            !editable && styles.disabled,
          ]}
        />

        {rightAccessory ? (
          <View style={styles.accessory}>{rightAccessory}</View>
        ) : null}
      </View>

      {message ? (
        <Text
          aria-live="polite"
          style={[styles.message, hasError ? styles.error : styles.helper]}
        >
          {message}
        </Text>
      ) : null}
    </View>
  );
}
