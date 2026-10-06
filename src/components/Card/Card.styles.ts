
import { radii, spacing, createStyles } from "@theme";

/** Border width of the outlined card. */
const CARD_BORDER = 1;

/**
 * Static styles for Card. Both variants share the 12px radius and 16px
 * padding; they differ only in fill and border. No shadow on either.
 */
export const useStyles = createStyles((colors) => ({
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
}));
