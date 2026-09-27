/**
 * Pre-auth intro step 1 — "Log every set."
 *
 * Text first, then a static slice of the Active Workout set table. The
 * fragment is a fixed preview, not a live component: it sits directly on
 * the canvas and is cut off at the bottom edge instead of being wrapped
 * in a card. "Skip" marks the intro as seen and lets the root navigator
 * swap straight to the auth stack.
 */
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { Button } from "@components/Button";
import { colors, fineSpacing, spacing } from "@theme";

import type { IntroStackParamList } from "@/app/navigation/types";
import { useAppStore } from "../store/appStore";
import { styles } from "./onboardingScreen.styles";

type Props = NativeStackScreenProps<IntroStackParamList, "Intro1">;

/** Rendered diameter of a set-number badge in the fragment. */
const BADGE_SIZE = 28;

/** Rendered diameter of the completed-set check circle. */
const CHECK_SIZE = 24;

/** Fixed rendered box for the check glyph inside a completed circle. */
const CHECK_GLYPH_STYLE = { width: 10, height: 10 } as const;

/** One row of the previewed set table. */
interface SetRowProps {
  index: number;
  /** Completed rows get a filled badge and a checked circle. */
  completed: boolean;
}

/** A single 44px set row: number badge, weight, reps, and check state. */
function SetRow({ index, completed }: SetRowProps): React.ReactElement {
  return (
    <View style={rowStyles.row}>
      <View style={rowStyles.cellSet}>
        <View
          style={[
            rowStyles.badge,
            completed ? rowStyles.badgeFilled : rowStyles.badgeOutline,
          ]}
        >
          <Text
            style={[
              rowStyles.badgeLabel,
              completed ? rowStyles.badgeLabelInverse : rowStyles.badgeLabelBase,
            ]}
          >
            {index}
          </Text>
        </View>
      </View>

      <View style={rowStyles.cellValue}>
        <Text style={rowStyles.value}>80</Text>
        <Text style={rowStyles.unit}>kg</Text>
      </View>

      <View style={rowStyles.cellValue}>
        <Text style={rowStyles.value}>8</Text>
      </View>

      <View style={rowStyles.cellCheck}>
        <View
          style={[
            rowStyles.check,
            completed ? rowStyles.checkFilled : rowStyles.checkOutline,
          ]}
        >
          {completed ? (
            <Svg
              fill="none"
              style={CHECK_GLYPH_STYLE}
              viewBox="0 0 12 10"
            >
              <Path
                d="M1 5L4.5 8.5L11 1.5"
                stroke={colors.textInverse}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
              />
            </Svg>
          ) : null}
        </View>
      </View>
    </View>
  );
}

/**
 * First intro screen. No back chevron — it is the start of the app, and
 * "Skip" is the only way out besides the primary CTA.
 */
export function Intro1Screen({ navigation }: Props): React.ReactElement {
  const markIntroSeen = useAppStore((state) => state.markIntroSeen);

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.topSlot} />
        <Pressable
          accessibilityLabel="Skip onboarding"
          accessibilityRole="button"
          onPress={markIntroSeen}
          testID="intro1-skip"
        >
          <Text style={styles.skipLabel}>Skip</Text>
        </Pressable>
      </View>

      <View style={styles.introBody}>
        <Text style={styles.introHeadline}>Log every set.</Text>
        <Text style={styles.introSupporting}>
          Track weight, reps and RPE as you train. Every set is saved
          instantly, even offline.
        </Text>

        <View style={styles.fragment}>
          <View style={fragmentStyles.titleRow}>
            <Text style={fragmentStyles.title}>Bench Press</Text>
            {/* Bare overflow glyph — no action behind it on this preview. */}
            <Text style={fragmentStyles.menuGlyph}>⋯</Text>
          </View>

          <View style={fragmentStyles.columnRow}>
            <Text style={[fragmentStyles.columnLabel, rowStyles.cellSet]}>
              Set
            </Text>
            <Text style={[fragmentStyles.columnLabel, rowStyles.cellValue]}>
              kg
            </Text>
            <Text style={[fragmentStyles.columnLabel, rowStyles.cellValue]}>
              reps
            </Text>
            <View style={rowStyles.cellCheck} />
          </View>

          <View style={fragmentStyles.hairline} />
          <SetRow completed index={1} />
          <View style={fragmentStyles.hairline} />
          <SetRow completed index={2} />
          <View style={fragmentStyles.hairline} />
          {/* Row 3 is pending and has no hairline below — the preview
              ends here rather than closing off the table. */}
          <SetRow completed={false} index={3} />
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          fullWidth
          label="Continue"
          onPress={() => navigation.navigate("Intro2")}
          testID="intro1-continue"
        />
      </View>
    </SafeAreaView>
  );
}

const fragmentStyles = StyleSheet.create({
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontFamily: "Inter-SemiBold",
    fontSize: 16,
    color: colors.textPrimary,
  },
  menuGlyph: {
    fontSize: 18,
    letterSpacing: -1,
    color: colors.textMuted,
  },
  columnRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  columnLabel: {
    fontFamily: "Inter-Medium",
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    color: colors.textMuted,
  },
  hairline: {
    height: 1,
    backgroundColor: colors.hairline,
  },
});

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    height: 44,
  },
  cellSet: {
    width: 44,
  },
  cellValue: {
    flex: 1,
    flexDirection: "row",
    alignItems: "baseline",
    gap: fineSpacing.unit,
  },
  cellCheck: {
    width: 40,
    alignItems: "flex-end",
  },
  badge: {
    width: BADGE_SIZE,
    height: BADGE_SIZE,
    borderRadius: BADGE_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeFilled: {
    backgroundColor: colors.primary,
  },
  badgeOutline: {
    borderWidth: 1,
    borderColor: colors.primary,
  },
  badgeLabel: {
    fontFamily: "Inter-SemiBold",
    fontSize: 13,
    fontVariant: ["tabular-nums"],
  },
  badgeLabelInverse: {
    color: colors.textInverse,
  },
  badgeLabelBase: {
    color: colors.textPrimary,
  },
  value: {
    fontFamily: "Inter-SemiBold",
    fontSize: 15,
    fontVariant: ["tabular-nums"],
    color: colors.textPrimary,
  },
  unit: {
    fontFamily: "Inter-Medium",
    fontSize: 12,
    color: colors.textMuted,
  },
  check: {
    width: CHECK_SIZE,
    height: CHECK_SIZE,
    borderRadius: CHECK_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  checkFilled: {
    backgroundColor: colors.primary,
  },
  checkOutline: {
    borderWidth: 1,
    borderColor: colors.primary,
  },
});
