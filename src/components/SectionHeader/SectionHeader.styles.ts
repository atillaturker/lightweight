
import { fineSpacing, fonts, spacing, type, createStyles } from "@theme";

/**
 * Static styles for SectionHeader. The row is a plain label baseline —
 * no background, border, shadow, or card. Vertical spacing is owned by
 * the parent so the header can sit in any section rhythm.
 *
 * Per DESIGN.md §6: section headers are 12px / 600 with 0.06em
 * tracking in the muted color. The label may follow a 16px glyph
 * (6px gap) or run into a hairline rule.
 */
export const useStyles = createStyles((colors) => ({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  /** Glyph + label group. */
  lead: {
    flexDirection: "row",
    alignItems: "center",
    gap: fineSpacing.tight,
    flexShrink: 1,
  },
  /** Without a rule the label group takes the free width. */
  leadFill: {
    flex: 1,
  },

  /** 1px hairline from the label to the right edge. */
  rule: {
    flex: 1,
    height: 1,
    marginLeft: spacing.md,
    backgroundColor: colors.hairline,
  },

  label: {
    ...type.caption,
    fontFamily: fonts.bodySemiBold,
    letterSpacing: 0.72,
    textTransform: "uppercase",
    color: colors.textMuted,
  },
}));
