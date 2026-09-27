import React from "react";
import { View, type ViewProps } from "react-native";

import { styles } from "./Card.styles";

/** Props for {@link Card}. */
export interface CardProps extends Omit<ViewProps, "style"> {
  /**
   * - `outlined` (default) — the v3 grouping card: canvas fill, 1px
   *   hairline border, 12px radius, 16px padding, no shadow.
   * - `well` — the v3 metric well: surface fill, no border, 12px radius,
   *   16px padding. For small-metric groups only; at most 3 per screen.
   */
  variant?: "outlined" | "well";
  children: React.ReactNode;
  testID?: string;
}

/**
 * Grouping surface for related content, per "Design enrichment v3" rules
 * 1 and 2. Never nest one Card inside another, and never put an
 * `outlined` card inside a `well`. Outer spacing belongs to the caller.
 */
export function Card({
  variant = "outlined",
  children,
  testID,
  ...rest
}: CardProps): React.ReactElement {
  return (
    <View
      style={variant === "well" ? styles.well : styles.outlined}
      testID={testID}
      {...rest}
    >
      {children}
    </View>
  );
}
