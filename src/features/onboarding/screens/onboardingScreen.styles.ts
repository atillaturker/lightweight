import { StyleSheet } from "react-native";

import { colors, gutter, spacing } from "@theme";

/** Step height of the two intro headlines, per the intro specs. */
const INTRO_HEADLINE_SIZE = 30;

/** Step height of the three setup headlines. */
const SETUP_HEADLINE_SIZE = 28;

/** Rendered width of the hairline that runs between setup rows. */
const ROW_DIVIDER_INSET = 38;

/** Bar under the intro fragment's projected bottom edge. */
export const INTRO_FRAGMENT_GAP = spacing.huge;

/** Vertical offset from the top row down to a setup screen's headline. */
export const SETUP_CONTENT_TOP = 72;

/** Vertical offset from a setup screen's supporting text to its options. */
export const SETUP_OPTIONS_TOP = spacing.huge;

/**
 * Static styles shared by the onboarding intro and setup screens.
 *
 * Each screen is a single column on the canvas: no cards, no surfaces, no
 * shadows. The layout is deliberately hard-coded to the surrounding
 * spacing because this is a designed one-shot flow, not a reusable page.
 * Typography is inline rather than from `@theme` because the intro and
 * setup specs use sizes and tracking that the shared scale does not carry.
 */
export const styles = StyleSheet.create({
  // ─── Chrome ───────────────────────────────────────────
  container: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  /** Top row + 12px: holds the skip action or the progress rail. */
  topRow: {
    height: 44,
    paddingHorizontal: gutter,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  /** The left and right slots keep the progress rail truly centered. */
  topSlot: {
    width: 64,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  topSlotRight: {
    width: 64,
    height: 44,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  skipLabel: {
    fontFamily: "Inter-Medium",
    fontSize: 15,
    color: colors.textMuted,
  },

  // ─── Intro ────────────────────────────────────────────
  introBody: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: gutter,
  },
  introHeadline: {
    fontFamily: "SpaceGrotesk-SemiBold",
    fontSize: INTRO_HEADLINE_SIZE,
    lineHeight: 34,
    letterSpacing: -1.0,
    color: colors.textPrimary,
  },
  introSupporting: {
    fontFamily: "Inter-Regular",
    fontSize: 15,
    lineHeight: 22,
    marginTop: spacing.md,
    color: colors.textBody,
  },
  fragment: {
    marginTop: INTRO_FRAGMENT_GAP,
  },

  // ─── Setup ────────────────────────────────────────────
  setupBody: {
    marginTop: SETUP_CONTENT_TOP,
    paddingHorizontal: gutter,
  },
  setupHeadline: {
    fontFamily: "SpaceGrotesk-SemiBold",
    fontSize: SETUP_HEADLINE_SIZE,
    lineHeight: 34,
    letterSpacing: -0.8,
    color: colors.textPrimary,
  },
  setupSupporting: {
    fontFamily: "Inter-Regular",
    fontSize: 15,
    lineHeight: 22,
    marginTop: spacing.sm,
    color: colors.textBody,
  },
  options: {
    marginTop: SETUP_OPTIONS_TOP,
  },
  /** Hairline between consecutive rows, inset past the radio. */
  rowDivider: {
    height: 1,
    marginLeft: ROW_DIVIDER_INSET,
    backgroundColor: colors.hairline,
  },

  // ─── Footer ───────────────────────────────────────────
  footer: {
    paddingHorizontal: gutter,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
});
