import { StyleSheet } from "react-native";

import { colors, gutter, type } from "@theme";

/** Header height, matching the platform-navigation convention. */
export const HEADER_HEIGHT = 44;

/** Square tap target reserved for each of the left and right slots. */
export const HEADER_SLOT_SIZE = 44;

/** Rendered edge length of the back chevron glyph. */
export const HEADER_CHEVRON_SIZE = 20;

/**
 * Static styles for ScreenHeader. The three-slot row keeps the title
 * optically centered no matter which slots are filled; there is no bottom
 * border and no shadow.
 */
export const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    height: HEADER_HEIGHT,
    paddingHorizontal: gutter,
    backgroundColor: colors.canvas,
  },

  slot: {
    width: HEADER_SLOT_SIZE,
    height: HEADER_SLOT_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },

  /**
   * The back target fills the left slot exactly, so the centered title is
   * unaffected by whether the chevron is showing.
   */
  back: {
    width: HEADER_SLOT_SIZE,
    height: HEADER_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    ...type.sectionTitle,
    flex: 1,
    textAlign: "center",
    color: colors.textPrimary,
  },

  /** Occupies the centered slot when no title is supplied. */
  titleSpacer: {
    flex: 1,
  },
});
