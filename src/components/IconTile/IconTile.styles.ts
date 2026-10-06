
import { fonts, radii, spacing, type, createStyles } from "@theme";

/** Edge length of the tile, per DESIGN.md §8. */
export const ICON_TILE_SIZE = spacing.huge;

/** Static styles for IconTile. Surface fill, control radius, no border. */
export const useStyles = createStyles((colors) => ({
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
}));
