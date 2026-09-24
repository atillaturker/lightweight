import { StyleSheet } from "react-native";

import { colors, fonts, spacing, type } from "@theme";

/** Total height of the tab row. */
export const ROW_HEIGHT = 32;

/** Thickness of the active-tab underline. */
export const UNDERLINE_HEIGHT = 2;

/**
 * Static styles for TextTabs. Active/inactive text and underline
 * visibility are composed as style arrays in the component.
 */
export const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    height: ROW_HEIGHT,
    gap: spacing.xxl,
  },

  scrollContent: {
    alignItems: "center",
    height: ROW_HEIGHT,
    gap: spacing.xxl,
    paddingHorizontal: 0,
  },

  tab: {
    alignItems: "center",
    justifyContent: "center",
    height: ROW_HEIGHT,
  },

  label: {
    ...type.label,
    color: colors.textMuted,
  },
  /**
   * Active tabs step up to Inter-SemiBold. The 13px size is unchanged;
   * weight 600 is realized by swapping the bundled font file rather
   * than by `fontWeight`, which custom fonts ignore on Android.
   */
  labelActive: {
    ...type.label,
    fontFamily: fonts.bodySemiBold,
    color: colors.textPrimary,
  },

  /** Sits directly under the text and matches the text width. */
  underline: {
    alignSelf: "stretch",
    height: UNDERLINE_HEIGHT,
    marginTop: spacing.sm - 2,
    backgroundColor: colors.primary,
  },
  underlineHidden: {
    backgroundColor: "transparent",
  },
});
