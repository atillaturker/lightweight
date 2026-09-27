/**
 * Home — Section 3, recent activity.
 *
 * A short list of the last few finished sessions, grouped in one Card
 * (v3 rule 1) under a clock-glyph section header (v3 rule 8). Row height is
 * fixed at 56px and hairlines are drawn between rows only. The right column
 * carries the session volume and a chevron — two pieces of information on
 * one row, but only one of them navigates.
 */
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '@components/Card';
import { SectionHeader } from '@components/SectionHeader';
import { colors, fineSpacing, spacing, type } from '@theme';

import { ChevronGlyph } from './Glyphs';

/** Fixed row height, per the list-row rule. */
export const RECENT_ROW_HEIGHT = 56;

/** Rendered edge length of the row chevron. */
const CHEVRON_SIZE = 16;

/** One recent session, already formatted for display. */
export interface RecentSessionRow {
  id: string;
  /** Routine name, or a fallback label for a routine-less session. */
  title: string;
  /** e.g. "Tue · 5 exercises · 48 min". */
  meta: string;
  /** Session volume, already formatted, e.g. "8.4t". */
  volume: string;
}

/** Props for {@link HomeRecentActivity}. */
export interface HomeRecentActivityProps {
  sessions: RecentSessionRow[];
  /** Called when a row is pressed. */
  onSelectSession: (sessionId: string) => void;
  /** Called when the "See all" action is pressed. */
  onPressSeeAll: () => void;
  testID?: string;
}

/** A single session row: text column on the left, volume and chevron right. */
function SessionRow({
  session,
  onPress,
}: {
  session: RecentSessionRow;
  onPress: () => void;
}): React.ReactElement {
  return (
    <Pressable
      accessibilityLabel={session.title}
      accessibilityRole="button"
      onPress={onPress}
      style={styles.row}
      testID={`home-recent-row-${session.id}`}
    >
      <View style={styles.text}>
        <Text numberOfLines={1} style={styles.title}>
          {session.title}
        </Text>
        <Text numberOfLines={1} style={styles.meta}>
          {session.meta}
        </Text>
      </View>

      <Text style={styles.volume}>{session.volume}</Text>
      <View style={styles.chevron}>
        <ChevronGlyph size={CHEVRON_SIZE} />
      </View>
    </Pressable>
  );
}

/**
 * Recent activity header plus up to three session rows. Renders nothing
 * when there is no history — the screen removes this section entirely in
 * the first-run state rather than showing an empty list.
 */
export function HomeRecentActivity({
  sessions,
  onSelectSession,
  onPressSeeAll,
  testID,
}: HomeRecentActivityProps): React.ReactElement | null {
  if (sessions.length === 0) return null;

  return (
    <View testID={testID}>
      <View style={styles.header}>
        <SectionHeader
          action={
            <Pressable
              accessibilityLabel="See all sessions"
              accessibilityRole="button"
              onPress={onPressSeeAll}
              style={styles.seeAll}
              testID={testID ? `${testID}-see-all` : undefined}
            >
              <Text style={styles.seeAllLabel}>See all</Text>
            </Pressable>
          }
          icon="clock"
          label="Recent activity"
        />
      </View>

      <View style={styles.list}>
        <Card>
          {sessions.map((session, index) => (
            <View key={session.id}>
              {index > 0 ? <View style={styles.divider} /> : null}
              <SessionRow
                onPress={() => onSelectSession(session.id)}
                session={session}
              />
            </View>
          ))}
        </Card>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.xl,
  },
  seeAll: {
    height: 44,
    justifyContent: 'center',
  },
  seeAllLabel: {
    ...type.label,
    color: colors.textMuted,
  },
  list: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  divider: {
    height: 1,
    backgroundColor: colors.hairline,
  },
  row: {
    height: RECENT_ROW_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    flex: 1,
  },
  title: {
    ...type.body,
    fontSize: 15,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  /** 2px below the title. */
  meta: {
    ...type.bodySmall,
    marginTop: fineSpacing.stack,
    color: colors.textMuted,
  },
  volume: {
    ...type.label,
    fontSize: 14,
    fontVariant: ['tabular-nums'],
    color: colors.textPrimary,
  },
  chevron: {
    marginLeft: spacing.sm,
  },
});
