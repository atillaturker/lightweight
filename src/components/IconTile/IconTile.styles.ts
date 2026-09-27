import { StyleSheet } from "react-native";

import { colors, fonts, radii, spacing, type } from "@theme";

/** Edge length of the tile, per v3 rule 10. */
export const ICON_TILE_SIZE = spacing.huge;

/** Static styles for IconTile. Surface fill, control radius, no border. */
export const styles = StyleSheet.create({
  tile: {
    width: ICON_TILE_SIZE,
    height: ICON_TILE_SIZE,
    borderRadius: radii.control,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  letter: {
    ...type.bodyLarge,
    fontFamily: fonts.bodySemiBold,
    color: colors.textPrimary,
  },
});
