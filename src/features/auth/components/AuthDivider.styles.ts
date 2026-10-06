
import { radii, type, createStyles } from "@theme";

/** Height of the centred "or" pill. */
export const DIVIDER_PILL_HEIGHT = 28;

/** Fixed width that keeps the pill wider than its label at any font scale. */
export const DIVIDER_PILL_WIDTH = 48;

/**
 * Static styles for AuthDivider. Separation is drawn with a 1px hairline
 * only — no shadow, blur, or gradient.
 */
export const useStyles = createStyles((colors) => ({
  container: {
    width: "100%",
    height: DIVIDER_PILL_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
  },

  /** The hairline the pill overlaps. */
  rule: {
    alignSelf: "stretch",
    height: 1,
    backgroundColor: colors.hairline,
  },

  pill: {
    position: "absolute",
    width: DIVIDER_PILL_WIDTH,
    height: DIVIDER_PILL_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.canvas,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: radii.pill,
  },

  pillLabel: {
    ...type.caption,
    fontWeight: "500",
    color: colors.textMuted,
  },
}));
