import React from "react";
import { Text, View, type ViewProps } from "react-native";

import { styles } from "./IconTile.styles";

/** Content of the tile: a centered glyph, or the first letter of a name. */
type IconTileContent =
  | {
      /** Centered glyph, e.g. a 20px `MuscleIcon`. */
      variant: "icon";
      icon: React.ReactNode;
    }
  | {
      /** First letter of `text`, uppercased. */
      variant: "letter";
      text: string;
    };

/** Props for {@link IconTile}. */
export type IconTileProps = Omit<ViewProps, "style" | "children"> &
  IconTileContent & { testID?: string };

/** First visible character of a name, uppercased; empty names get none. */
export function toMonogram(text: string): string {
  const first = Array.from(text.trim())[0];
  return first === undefined ? "" : first.toUpperCase();
}

/**
 * 40px leading visual for a list row ("Design enrichment v3", rule 10):
 * surface fill, 8px radius, no border, never colored.
 *
 * Variants:
 * - `icon` — centers the given glyph.
 * - `letter` — shows the first letter of `text` in Inter 16px / 600.
 */
export function IconTile(props: IconTileProps): React.ReactElement {
  if (props.variant === "icon") {
    const { variant: _variant, icon, testID, ...rest } = props;
    return (
      <View style={styles.tile} testID={testID} {...rest}>
        {icon}
      </View>
    );
  }

  const { variant: _variant, text, testID, ...rest } = props;
  return (
    <View
      importantForAccessibility="no-hide-descendants"
      style={styles.tile}
      testID={testID}
      {...rest}
    >
      <Text style={styles.letter}>{toMonogram(text)}</Text>
    </View>
  );
}
