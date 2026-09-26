/**
 * One selectable setup row: a {@link Radio} indicator plus a text column,
 * sitting directly on the canvas.
 *
 * The row itself owns the tap target and the accessibility state; the
 * radio is rendered as a non-interactive visual indicator so there is only
 * ever one pressable and one radio role in the row. Rows never get a card,
 * border, or surface fill — the hairline between rows is the caller's job,
 * which also keeps the first and last rows unbounded.
 */
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Radio } from "@components/Radio";
import { colors, spacing } from "@theme";

/** Row height when the option has a single line of text. */
export const OPTION_ROW_HEIGHT = 64;

/** Row height when the option carries a description line as well. */
export const OPTION_ROW_HEIGHT_TALL = 76;

/** Props for {@link SetupOptionRow}. */
export interface SetupOptionRowProps {
  /** Primary line, e.g. "Kilograms (kg)". */
  title: string;
  /** Optional second line, e.g. "3 sessions · 18 exercises". */
  subtitle?: string;
  selected: boolean;
  onPress: () => void;
  testID?: string;
}

/**
 * A setup option row. Selection is expressed by the radio indicator only;
 * the label color never changes, so an unselected row is not dimmed.
 */
export function SetupOptionRow({
  title,
  subtitle,
  selected,
  onPress,
  testID,
}: SetupOptionRowProps): React.ReactElement {
  return (
    <Pressable
      accessibilityLabel={title}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[
        styles.row,
        subtitle ? styles.rowTall : null,
      ]}
      testID={testID}
    >
      {/* The radio is decorative here — the row owns press and state. */}
      <View pointerEvents="none">
        <Radio selected={selected} />
      </View>

      <View style={styles.text}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    height: OPTION_ROW_HEIGHT,
  },
  rowTall: {
    height: OPTION_ROW_HEIGHT_TALL,
  },
  text: {
    flex: 1,
    marginLeft: spacing.lg,
  },
  title: {
    fontFamily: "Inter-Medium",
    fontSize: 17,
    color: colors.textPrimary,
  },
  subtitle: {
    fontFamily: "Inter-Regular",
    fontSize: 13,
    marginTop: 2,
    color: colors.textMuted,
  },
});
