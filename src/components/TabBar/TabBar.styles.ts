import { StyleSheet } from "react-native";

import { colors, spacing, type } from "@theme";

/** Bar height above the bottom safe-area inset. */
export const TAB_BAR_HEIGHT = 56;

/** Thickness of the single top hairline that separates bar from content. */
export const TAB_BAR_HAIRLINE = 1;

/** Vertical gap between a tab's icon and its label. */
export const TAB_ICON_LABEL_GAP = spacing.xs;

/** Color of the active tab's icon and label. */
export const TAB_ACTIVE_COLOR = colors.primary;

/** Color of every inactive tab's icon and label. */
export const TAB_INACTIVE_COLOR = colors.textMuted;

/**
 * Static styles for TabBar. The bar height and bottom inset depend on
 * runtime safe-area values and are applied inline; active state is
 * expressed through color only — no pill, indicator, or surface change.
 */
export const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "stretch",
    backgroundColor: colors.canvas,
    borderTopWidth: TAB_BAR_HAIRLINE,
    borderTopColor: colors.hairline,
  },

  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: TAB_ICON_LABEL_GAP,
  },

  label: {
    ...type.labelSmall,
    color: TAB_INACTIVE_COLOR,
  },
  /** Active label switches to primary; the icon color is set to match. */
  labelActive: {
    color: TAB_ACTIVE_COLOR,
  },
});
