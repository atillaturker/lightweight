/**
 * Welcome — the very first screen of a fresh install.
 *
 * Structure follows the Stitch "Welcome − Kinetic Strength Analytics"
 * screen: a left-aligned brand row, a left-aligned copy block (overline,
 * display headline, supporting line), the full-bleed product-data
 * preview carousel, a "THIS MONTH" stat row (goal ring + weekly volume
 * bars), and one pinned primary action.
 *
 * Every product preview on the screen is strictly monochrome — the
 * accent color never appears here, because nothing on Welcome is a live
 * state.
 *
 * Both actions mark the welcome as seen so it is never shown again on
 * this install. "Get started" continues into the intro group; "I already
 * have an account" also marks the intro as seen, which makes the root
 * navigator swap straight to the auth stack.
 */
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { Button } from "@components/Button";
import { SectionHeader } from "@components/SectionHeader";
import { colors, gutter, spacing } from "@theme";

import type { IntroStackParamList } from "@/app/navigation/types";
import { useAppStore } from "@/app/store";
import { WelcomeChartCarousel } from "../components/WelcomeChartCarousel";
import { WelcomeMonthlyStats } from "../components/WelcomeMonthlyStats";

type Props = NativeStackScreenProps<IntroStackParamList, "Welcome">;

/** Rendered box of the rounded product mark. */
const MARK_SIZE = 56;

/** Corner radius of the product mark, per the welcome spec. */
const MARK_RADIUS = 14;

/** Rendered box of the monoline "K" glyph inside the mark. */
const GLYPH_SIZE = 32;

/** Vertical offset from the brand row down to the copy block. */
const COPY_TOP = spacing.huge;

/** Offset from the copy block down to the carousel. */
const CAROUSEL_TOP = spacing.xxl;

/** Offset from the carousel down to the "THIS MONTH" section header. */
const STATS_TOP = spacing.xxxl;

/** Offset from the section header down to the stat row. */
const STATS_HEADER_GAP = spacing.lg;

/** Offset from the stat row down to the pinned action area. */
const FOOTER_TOP = spacing.xxxl;

/** Static style for the SVG glyph box. */
const GLYPH_STYLE = { width: GLYPH_SIZE, height: GLYPH_SIZE } as const;

/**
 * The 56px rounded square carrying the product monogram — a vertical
 * stem with a short and a long diagonal, drawn as monoline strokes.
 */
function ProductMark(): React.ReactElement {
  return (
    <View style={styles.mark}>
      <Svg
        fill="none"
        height={GLYPH_SIZE}
        style={GLYPH_STYLE}
        viewBox="0 0 32 32"
        width={GLYPH_SIZE}
      >
        <Path
          d="M10 6V26H23"
          fill="none"
          stroke={colors.textInverse}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2.5}
        />
      </Svg>
    </View>
  );
}

/**
 * First-run entry point. Only "Get started" continues the first-run
 * flow; the account action exits it for returning users.
 */
export function WelcomeScreen({ navigation }: Props): React.ReactElement {
  const markWelcomeSeen = useAppStore((state) => state.markWelcomeSeen);
  const markIntroSeen = useAppStore((state) => state.markIntroSeen);

  const handleGetStarted = (): void => {
    markWelcomeSeen();
    navigation.navigate("Intro1");
  };

  const handleHaveAccount = (): void => {
    markWelcomeSeen();
    markIntroSeen();
  };

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        testID="welcome-scroll"
      >
        <View style={styles.brandRow}>
          <ProductMark />
          <Text style={styles.wordmark}>Kinetic</Text>
        </View>

        <View style={styles.copy}>
          <Text style={styles.overline}>Strength analytics</Text>
          <Text style={styles.headline}>Train with intention.</Text>
          <Text style={styles.supporting}>
            Log every set. See every trend. Understand your strength
            progression over time.
          </Text>
        </View>

        <View style={styles.carousel}>
          <WelcomeChartCarousel />
        </View>

        <View style={styles.stats}>
          <SectionHeader label="This month" testID="welcome-stats-header" />
          <View style={styles.statsRow}>
            <WelcomeMonthlyStats />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          fullWidth
          label="Get started"
          onPress={handleGetStarted}
          testID="welcome-get-started"
        />

        <Pressable
          accessibilityLabel="I already have an account"
          accessibilityRole="button"
          onPress={handleHaveAccount}
          style={styles.accountAction}
          testID="welcome-have-account"
        >
          <Text style={styles.accountLabel}>I already have an account</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  content: {
    paddingBottom: spacing.xxl,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.xxl,
    paddingHorizontal: gutter,
  },
  mark: {
    width: MARK_SIZE,
    height: MARK_SIZE,
    borderRadius: MARK_RADIUS,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
  },
  /** 14px to the right of the mark, per the spec. */
  wordmark: {
    fontFamily: "SpaceGrotesk-SemiBold",
    fontSize: 26,
    letterSpacing: -0.78,
    marginLeft: 14,
    color: colors.textPrimary,
  },
  copy: {
    marginTop: COPY_TOP,
    paddingHorizontal: gutter,
  },
  overline: {
    fontFamily: "Inter-Medium",
    fontSize: 11,
    letterSpacing: 0.88,
    textTransform: "uppercase",
    color: colors.textMuted,
  },
  headline: {
    fontFamily: "SpaceGrotesk-SemiBold",
    fontSize: 34,
    lineHeight: 36,
    letterSpacing: -1.0,
    marginTop: spacing.md,
    color: colors.textPrimary,
  },
  supporting: {
    fontFamily: "Inter-Regular",
    fontSize: 15,
    lineHeight: 22,
    marginTop: spacing.md,
    maxWidth: 340,
    color: colors.textBody,
  },
  carousel: {
    marginTop: CAROUSEL_TOP,
  },
  /** 32px below the carousel, per the welcome stat spec. */
  stats: {
    marginTop: STATS_TOP,
    paddingHorizontal: gutter,
  },
  /** 16px below the "THIS MONTH" header. */
  statsRow: {
    marginTop: STATS_HEADER_GAP,
  },
  footer: {
    paddingHorizontal: gutter,
    paddingTop: FOOTER_TOP,
    paddingBottom: spacing.xl,
  },
  accountAction: {
    height: 44,
    marginTop: spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  accountLabel: {
    fontFamily: "Inter-Medium",
    fontSize: 15,
    color: colors.textPrimary,
  },
});
