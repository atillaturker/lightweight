import React from "react";
import {
  Image,
  Pressable,
  Text,
  View,
  type ViewProps,
} from "react-native";

import { Toggle } from "@components/Toggle";
import { svgIcon, svgToDataUri } from "@lib/svg";
import { colors } from "@theme";

import {
  SETTINGS_ROW_CHEVRON_SIZE,
  styles,
} from "./SettingsRow.styles";

/**
 * SettingsRow variants — each renders exactly one right-hand element:
 * - `chevron` — 16px muted chevron; the row navigates to a sub-screen.
 * - `value` — muted value text followed by the chevron.
 * - `toggle` — a controlled {@link Toggle}.
 * - `destructive` — error-colored label with the same muted chevron.
 * - `plain` — label and tap target only, nothing on the right.
 */
export type SettingsRowVariant =
  | "chevron"
  | "value"
  | "toggle"
  | "destructive"
  | "plain";

/** Props for {@link SettingsRow}. */
export interface SettingsRowProps
  extends Omit<ViewProps, "style" | "children" | "onPress"> {
  label: string;
  variant?: SettingsRowVariant;
  /** Right-hand text for the `value` variant. */
  value?: string;
  /** Current state for the `toggle` variant. */
  toggleValue?: boolean;
  /** Called with the next state when the toggle is flipped. */
  onToggleChange?: (value: boolean) => void;
  onPress?: () => void;
  testID?: string;
}

/** Fixed rendered box for the chevron glyph — the size is not dynamic. */
const CHEVRON_STYLE = {
  width: SETTINGS_ROW_CHEVRON_SIZE,
  height: SETTINGS_ROW_CHEVRON_SIZE,
} as const;

/** The 16px monoline chevron that marks a navigating row. */
function Chevron({ testID }: { testID?: string }): React.ReactElement {
  const uri = svgToDataUri(
    svgIcon(
      SETTINGS_ROW_CHEVRON_SIZE,
      `<path d="M9 6l6 6-6 6" fill="none" stroke="${colors.textMuted}" ` +
        'stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/>',
    ),
  );

  return (
    <Image
      accessibilityIgnoresInvertColors
      source={{ uri }}
      style={CHEVRON_STYLE}
      testID={testID}
    />
  );
}

/**
 * Right-hand slot for the row. Renders exactly one element based on the
 * variant, so a row can never show two trailing affordances at once.
 */
function RightAccessory({
  variant,
  value,
  toggleValue,
  onToggleChange,
  testID,
}: {
  variant: SettingsRowVariant;
  value?: string;
  toggleValue?: boolean;
  onToggleChange?: (value: boolean) => void;
  testID?: string;
}): React.ReactElement | null {
  const chevron = <Chevron testID={testID ? `${testID}-chevron` : undefined} />;

  switch (variant) {
    case "chevron":
    case "destructive":
      return (
        <View style={styles.right} testID={testID ? `${testID}-right` : undefined}>
          {chevron}
        </View>
      );
    case "value":
      return (
        <View style={styles.right} testID={testID ? `${testID}-right` : undefined}>
          <Text numberOfLines={1} style={styles.value}>
            {value}
          </Text>
          {chevron}
        </View>
      );
    case "toggle":
      return (
        <View style={styles.right} testID={testID ? `${testID}-right` : undefined}>
          <Toggle
            onChange={onToggleChange ?? (() => {})}
            testID={testID ? `${testID}-toggle` : undefined}
            value={toggleValue ?? false}
          />
        </View>
      );
    case "plain":
    default:
      return null;
  }
}

/**
 * Shared settings list row. Renders no background, border, or shadow;
 * the parent manages the hairline between rows. The row becomes a
 * Pressable only when `onPress` is supplied, with a 52px tap target.
 */
export function SettingsRow({
  label,
  variant = "chevron",
  value,
  toggleValue,
  onToggleChange,
  onPress,
  testID,
  ...rest
}: SettingsRowProps): React.ReactElement {
  const labelStyle = [
    styles.label,
    variant === "destructive" && styles.labelDestructive,
  ];

  const content = (
    <>
      <Text numberOfLines={1} style={labelStyle}>
        {label}
      </Text>

      <RightAccessory
        onToggleChange={onToggleChange}
        testID={testID}
        toggleValue={toggleValue}
        value={value}
        variant={variant}
      />
    </>
  );

  if (onPress) {
    return (
      <Pressable
        accessibilityLabel={label}
        accessibilityRole="button"
        onPress={onPress}
        style={styles.row}
        testID={testID}
        {...rest}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <View style={styles.row} testID={testID} {...rest}>
      {content}
    </View>
  );
}
