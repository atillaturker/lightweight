/**
 * Home — Section 1, the next-session block.
 *
 * The overline sits on the canvas; the routine name, meta line, and
 * primary CTA are grouped in a single flat card, because they describe
 * one decision ("start this session"). The card uses the canvas fill
 * plus a 1px hairline, per the v2 enrichment rules — no shadow.
 *
 * When a session is already open the same block reframes as "IN
 * PROGRESS" and the CTA resumes instead of starting. The 6px dot under
 * the CTA marks that live state, one of the screen's permitted accent
 * uses.
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@components/Button';
import { colors, fonts, radii, spacing, type } from '@theme';

/** Rendered diameter of the live-session indicator dot. */
const LIVE_DOT_SIZE = 6;

/** Gap between the CTA and the live-session row below it. */
const LIVE_ROW_GAP = spacing.xs;

/** Gap between the CTA and a centered footnote below it. */
const FOOTNOTE_GAP = spacing.xxxl;

/** Border width of the flat card surrounding the primary action group. */
const CARD_BORDER = 1;

/** Props for {@link HomeNextSession}. */
export interface HomeNextSessionProps {
  /** Small uppercase label above the title. */
  overline: string;
  /** Routine name, or the first-run headline. */
  title: string;
  /** Supporting line under the title. */
  meta: string;
  /** Label of the single primary action. */
  ctaLabel: string;
  /** Called when the primary action is pressed. */
  onPress: () => void;
  /** Renders the live-session indicator below the CTA. */
  isLive?: boolean;
  /** Centered muted line rendered below the CTA. */
  footnote?: string;
  testID?: string;
}

/**
 * The dominant block of the Today screen. Exactly one primary action, and
 * never a second button — the footnote is a plain line, not an action.
 */
export function HomeNextSession({
  overline,
  title,
  meta,
  ctaLabel,
  onPress,
  isLive = false,
  footnote,
  testID,
}: HomeNextSessionProps): React.ReactElement {
  return (
    <View style={styles.block} testID={testID}>
      <Text style={styles.overline}>{overline}</Text>

      <View style={styles.card}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.meta}>{meta}</Text>

        <View style={styles.cta}>
          <Button
            fullWidth
            label={ctaLabel}
            onPress={onPress}
            testID={testID ? `${testID}-cta` : undefined}
          />
        </View>

        {isLive ? (
          <View style={styles.liveRow} testID={testID ? `${testID}-live` : undefined}>
            <View style={styles.liveDot} />
            <Text style={styles.liveLabel}>Active session</Text>
          </View>
        ) : null}
      </View>

      {footnote !== undefined ? (
        <Text style={styles.footnote}>{footnote}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    paddingHorizontal: spacing.xl,
  },
  overline: {
    ...type.caption,
    fontFamily: fonts.bodySemiBold,
    letterSpacing: 0.72,
    textTransform: 'uppercase',
    color: colors.textMuted,
  },
  /** 10px below the overline; flat card, never nested. */
  card: {
    marginTop: spacing.sm + 2,
    padding: spacing.lg,
    borderRadius: radii.card,
    borderWidth: CARD_BORDER,
    borderColor: colors.hairline,
    backgroundColor: colors.canvas,
  },
  title: {
    ...type.display,
    color: colors.textPrimary,
  },
  /** 6px below the title. */
  meta: {
    ...type.body,
    fontSize: 14,
    marginTop: spacing.xs + 2,
    color: colors.textBody,
  },
  /** 20px below the meta line, per the spec. */
  cta: {
    marginTop: spacing.xl,
  },
  liveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: LIVE_ROW_GAP,
    gap: spacing.sm,
  },
  liveDot: {
    width: LIVE_DOT_SIZE,
    height: LIVE_DOT_SIZE,
    borderRadius: LIVE_DOT_SIZE / 2,
    backgroundColor: colors.accent,
  },
  liveLabel: {
    ...type.labelSmall,
    fontSize: 12,
    letterSpacing: 0,
    color: colors.textMuted,
  },
  footnote: {
    ...type.body,
    fontSize: 14,
    marginTop: FOOTNOTE_GAP,
    textAlign: 'center',
    color: colors.textMuted,
  },
});
