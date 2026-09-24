import { TextStyle } from "react-native";

/**
 * Font families. Must match the names registered in react-native-asset
 * or the Expo font loader.
 */
export const fonts = {
  display: "SpaceGrotesk-SemiBold",
  bodyRegular: "Inter-Regular",
  bodyMedium: "Inter-Medium",
  bodySemiBold: "Inter-SemiBold",
} as const;

type TypeStyle = Pick<
  TextStyle,
  "fontFamily" | "fontSize" | "fontWeight" | "letterSpacing" | "lineHeight"
>;

/**
 * Type styles. Compose these onto Text components. Every text in the
 * app uses one of these — no ad-hoc fontSize or fontWeight.
 */
export const type: Record<string, TypeStyle> = {
  // ─── Display ──────────────────────────────────────────
  displayLarge: {
    fontFamily: fonts.display,
    fontSize: 34,
    letterSpacing: -1.0,
    lineHeight: 38,
  },
  display: {
    fontFamily: fonts.display,
    fontSize: 28,
    letterSpacing: -0.7,
    lineHeight: 34,
  },
  headline: {
    fontFamily: fonts.display,
    fontSize: 24,
    letterSpacing: -0.6,
    lineHeight: 30,
  },
  sectionTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 16,
    letterSpacing: -0.2,
    lineHeight: 20,
  },

  // ─── Metrics ──────────────────────────────────────────
  metricHero: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 44,
    letterSpacing: -1.3,
    lineHeight: 48,
  },
  metricLarge: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 24,
    letterSpacing: -0.6,
    lineHeight: 28,
  },
  metric: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 20,
    letterSpacing: -0.5,
    lineHeight: 24,
  },

  // ─── Body ─────────────────────────────────────────────
  bodyLarge: {
    fontFamily: fonts.bodyRegular,
    fontSize: 16,
    letterSpacing: -0.1,
    lineHeight: 24,
  },
  body: {
    fontFamily: fonts.bodyRegular,
    fontSize: 15,
    letterSpacing: -0.1,
    lineHeight: 22,
  },
  bodySmall: {
    fontFamily: fonts.bodyRegular,
    fontSize: 13,
    letterSpacing: 0,
    lineHeight: 18,
  },

  // ─── Labels ───────────────────────────────────────────
  label: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    letterSpacing: 0,
    lineHeight: 18,
  },
  labelSmall: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    letterSpacing: 0.5,
    lineHeight: 14,
  },
  caption: {
    fontFamily: fonts.bodyRegular,
    fontSize: 12,
    letterSpacing: 0,
    lineHeight: 16,
  },

  // ─── Buttons ──────────────────────────────────────────
  button: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    letterSpacing: 0,
    lineHeight: 20,
  },
  buttonSmall: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    letterSpacing: 0,
    lineHeight: 18,
  },
} as const;

export type TypeToken = keyof typeof type;
