/**
 * Home — Section 2, the weekly summary strip.
 *
 * A ring on the left answers "how close am I to this week's goal" and
 * three bare stat columns answer the rest. The whole group sits in one
 * metric well (`Card variant="well"`, v3 rule 2). The streak label carries
 * a flame glyph — the one metric here with a natural symbol (v3 rule 6).
 *
 * The ring is a supporting element: fixed at 72px, deliberately smaller
 * than the routine name above it, and it never replaces the number — the
 * value is centered inside it. When the weekly goal is met the ring fill
 * switches to the accent color, marking the single data highlight.
 *
 * The volume delta is the only place `colors.success` may appear on this
 * screen, and only for a rise. A dip stays muted: a deload is not an
 * error state.
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Card } from '@components/Card';
import { RingChart } from '@components/RingChart';
import { colors, spacing } from '@theme';
import { formatDeltaLabel } from '@lib/format';

import { StatColumn, StatStrip } from './StatColumn';

/** Ring diameter, per the Home spec. Compact ring, so a 3px stroke. */
export const WEEKLY_GOAL_RING_SIZE = 72;

/** Horizontal gap between the ring and the first stat column. */
const RING_GAP = spacing.xl;

/** Props for {@link HomeWeeklyStrip}. */
export interface HomeWeeklyStripProps {
  /** Sessions completed in the current week. */
  sessionsThisWeek: number;
  /** Weekly session goal. */
  goal: number;
  /** Volume this week in kilograms, already formatted. */
  volume: string;
  /** Percent change against last week, or `null` with no comparison. */
  volumeDeltaPercent: number | null;
  /** Consecutive weeks with at least one qualifying session. */
  streakWeeks: number;
  testID?: string;
}

/**
 * Weekly figures: goal ring plus sessions, volume, and streak columns,
 * grouped on one soft surface block. Hairlines separate the columns only
 * — the ring has no divider.
 */
export function HomeWeeklyStrip({
  sessionsThisWeek,
  goal,
  volume,
  volumeDeltaPercent,
  streakWeeks,
  testID,
}: HomeWeeklyStripProps): React.ReactElement {
  const deltaLabel = formatDeltaLabel(volumeDeltaPercent);
  const isRise = volumeDeltaPercent !== null && volumeDeltaPercent > 0;
  const goalMet = sessionsThisWeek >= goal;

  return (
    <View style={styles.block}>
      <Card testID={testID} variant="well">
        <View style={styles.row}>
          <RingChart
            centerLabel={`${sessionsThisWeek}/${goal}`}
            centerSublabel="goal"
            color={goalMet ? colors.accent : undefined}
            max={goal}
            size={WEEKLY_GOAL_RING_SIZE}
            testID={testID ? `${testID}-ring` : undefined}
            value={sessionsThisWeek}
          />

          <View style={styles.strip}>
            <StatStrip>
              <StatColumn
                caption="sessions"
                label="This week"
                testID={testID ? `${testID}-sessions` : undefined}
                value={`${sessionsThisWeek} / ${goal}`}
              />
              <StatColumn
                caption={deltaLabel ?? undefined}
                captionColor={isRise ? colors.success : undefined}
                label="Volume"
                testID={testID ? `${testID}-volume` : undefined}
                value={volume}
              />
              <StatColumn
                caption="weeks"
                icon="flame"
                label="Streak"
                testID={testID ? `${testID}-streak` : undefined}
                value={String(streakWeeks)}
              />
            </StatStrip>
          </View>
        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    marginHorizontal: spacing.xl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  strip: {
    flex: 1,
    marginLeft: RING_GAP,
  },
});
