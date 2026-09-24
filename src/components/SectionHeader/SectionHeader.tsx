import React from "react";
import { Text, View, type ViewProps } from "react-native";

import { styles } from "./SectionHeader.styles";

/** Props for {@link SectionHeader}. */
export interface SectionHeaderProps
  extends Omit<ViewProps, "style" | "children"> {
  /** Uppercase group label, e.g. "THIS WEEK" or "ACCOUNT". */
  label: string;
  /** Optional right-aligned node, typically a "See all" text action. */
  action?: React.ReactNode;
  testID?: string;
}

/**
 * Plain uppercase label that introduces a group of rows or cards. The
 * caller owns the vertical spacing above and below; this component only
 * lays out the label and the optional action slot in a single
 * space-between row.
 *
 * The action node is rendered as-is — SectionHeader does not style it.
 */
export function SectionHeader({
  label,
  action,
  testID,
  ...rest
}: SectionHeaderProps): React.ReactElement {
  return (
    <View style={styles.row} testID={testID} {...rest}>
      <Text numberOfLines={1} style={styles.label}>
        {label}
      </Text>

      {action ? (
        <View testID={testID ? `${testID}-action` : undefined}>{action}</View>
      ) : null}
    </View>
  );
}
