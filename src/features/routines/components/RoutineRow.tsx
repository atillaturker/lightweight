/**
 * A single routine row: name, estimated meta line, an active marker, and a
 * "⋯" overflow action.
 *
 * Shared by the Routines list and Home's "My Routines" section so both read
 * the same and expose exactly one row-level affordance. There is no
 * long-press and no trailing chevron — the "⋯" opens the action sheet.
 *
 * The active routine is marked with a 6px accent dot immediately before the
 * "⋯", matching the routines design. At most one row carries it.
 *
 * Per "Design enrichment v3" rule 10 the row leads with a 40px letter tile.
 * The `inset` variant drops the gutter padding for rows grouped in a Card.
 */
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

import { IconTile } from "@components/IconTile";
import { colors, fineSpacing, gutter, spacing, type } from "@theme";

/** Rendered edge length of the overflow glyph. */
const MORE_GLYPH_SIZE = 20;

/** Rendered diameter of the active-routine dot. */
const ACTIVE_DOT_SIZE = 6;

/** Square tap target for the row's overflow action. */
const MORE_TAP_TARGET = 44;

/** Props for {@link RoutineRow}. */
export interface RoutineRowProps {
  /** Routine name. */
  name: string;
  /** Supporting line, e.g. "12 exercises · ~100 min". */
  meta: string;
  /** Whether this routine is the active one. */
  isActive: boolean;
  /** Called when the row body is pressed. */
  onPress: () => void;
  /** Called when the "⋯" action is pressed. */
  onPressMore: () => void;
  /**
   * `list` (default) pads the row to the screen gutter; `inset` has no
   * horizontal padding, for rows inside a Card that already pads them.
   */
  variant?: "list" | "inset";
  testID?: string;
}

/** Three-dot overflow glyph drawn on react-native-svg. */
function MoreGlyph(): React.ReactElement {
  return (
    <Svg height={MORE_GLYPH_SIZE} viewBox="0 0 24 24" width={MORE_GLYPH_SIZE}>
      <Circle cx={5} cy={12} fill={colors.textMuted} r={1.5} />
      <Circle cx={12} cy={12} fill={colors.textMuted} r={1.5} />
      <Circle cx={19} cy={12} fill={colors.textMuted} r={1.5} />
    </Svg>
  );
}

/** 6px accent dot marking the active routine. */
function ActiveDot(): React.ReactElement {
  return (
    <Svg
      height={ACTIVE_DOT_SIZE}
      style={styles.activeDot}
      testID="routine-active-dot"
      viewBox="0 0 6 6"
      width={ACTIVE_DOT_SIZE}
    >
      <Circle cx={3} cy={3} fill={colors.accent} r={3} />
    </Svg>
  );
}

/** Routine list row shared by the Routines screen and Home. */
export function RoutineRow({
  name,
  meta,
  isActive,
  onPress,
  onPressMore,
  variant = "list",
  testID,
}: RoutineRowProps): React.ReactElement {
  return (
    <Pressable
      accessibilityLabel={name}
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.row, variant === "list" ? styles.rowList : null]}
      testID={testID}
    >
      <IconTile text={name} variant="letter" />

      <View style={styles.textColumn}>
        <Text numberOfLines={1} style={styles.name}>
          {name}
        </Text>
        <Text style={styles.meta}>{meta}</Text>
      </View>

      {isActive ? <ActiveDot /> : null}

      <Pressable
        accessibilityLabel={`${name} actions`}
        accessibilityRole="button"
        onPress={onPressMore}
        style={styles.moreButton}
        testID={testID ? `${testID}-more` : undefined}
      >
        <MoreGlyph />
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 72,
  },
  rowList: {
    paddingHorizontal: gutter,
  },

  textColumn: {
    flex: 1,
    marginLeft: spacing.md,
    justifyContent: "center",
  },
  name: {
    ...type.body,
    fontSize: 15,
    fontWeight: "500",
    color: colors.textPrimary,
  },
  meta: {
    ...type.bodySmall,
    marginTop: fineSpacing.stack,
    fontVariant: ["tabular-nums"],
    color: colors.textMuted,
  },

  moreButton: {
    width: MORE_TAP_TARGET,
    height: MORE_TAP_TARGET,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: spacing.xs,
    marginRight: -spacing.sm,
  },
  activeDot: {
    marginRight: spacing.sm,
  },
});
