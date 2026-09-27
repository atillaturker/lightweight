import { StyleSheet } from "react-native";

import { colors, radii, spacing } from "@theme";

/** Border width of the outlined card. */
const CARD_BORDER = 1;

/**
 * Static styles for Card. Both variants share the 12px radius and 16px
 * padding; they differ only in fill and border. No shadow on either.
 */
export const styles = StyleSheet.create({
  outlined: {
    padding: spacing.lg,
    borderRadius: radii.card,
    borderWidth: CARD_BORDER,
    borderColor: colors.hairline,
    backgroundColor: colors.canvas,
  },
  well: {
    padding: spacing.lg,
    borderRadius: radii.card,
    backgroundColor: colors.surface,
  },
});
