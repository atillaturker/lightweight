import React from "react";
import { Text, View, type ViewProps } from "react-native";

import { LineIcon, type LineIconName } from "../LineIcon";

import { styles } from "./SectionHeader.styles";

/**
 * Decoration of the header row ("Design enrichment v3", rule 8). A header
 * carries a glyph OR a rule, never both.
 */
type SectionHeaderDecoration =
  | {
      /** `plain` (default): the label alone, or with `icon`. */
      variant?: "plain";
      /** Optional 16px monoline glyph, 6px before the label. */
      icon?: LineIconName;
    }
  | {
      /**
       * `rule`: a 1px hairline from the label to the right edge. Drawn only
       * when there is no `action` — an action owns that space.
       */
      variant: "rule";
      icon?: never;
    };

/** Props for {@link SectionHeader}. */
export type SectionHeaderProps = Omit<ViewProps, "style" | "children"> &
  SectionHeaderDecoration & {
    /** Uppercase group label, e.g. "THIS WEEK" or "ACCOUNT". */
    label: string;
    /** Optional right-aligned node, typically a "See all" text action. */
    action?: React.ReactNode;
    testID?: string;
  };

/**
 * Plain uppercase label that introduces a group of rows or cards. The
 * caller owns the vertical spacing above and below; this component only
 * lays out the optional glyph, the label, and either the action slot or
 * the rule in a single row.
 *
 * The action node is rendered as-is — SectionHeader does not style it.
 */
export function SectionHeader({
  label,
  action,
  variant = "plain",
  icon,
  testID,
  ...rest
}: SectionHeaderProps): React.ReactElement {
  const showRule = variant === "rule" && !action;

  return (
    <View style={styles.row} testID={testID} {...rest}>
      <View style={[styles.lead, showRule ? null : styles.leadFill]}>
        {icon !== undefined ? (
          <LineIcon
            name={icon}
            testID={testID ? `${testID}-icon` : undefined}
          />
        ) : null}
        <Text numberOfLines={1} style={styles.label}>
          {label}
        </Text>
      </View>

      {showRule ? (
        <View
          style={styles.rule}
          testID={testID ? `${testID}-rule` : undefined}
        />
      ) : null}

      {action ? (
        <View testID={testID ? `${testID}-action` : undefined}>{action}</View>
      ) : null}
    </View>
  );
}
