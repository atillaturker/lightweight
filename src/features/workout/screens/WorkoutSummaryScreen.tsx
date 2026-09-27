/**
 * Post-workout summary — the last screen of the training loop.
 *
 * Three states share one layout:
 *
 * 1. **Recorded session** — overline, routine name, date, hero duration,
 *    the volume/sets/reps strip, and a personal-records section when the
 *    session set any.
 * 2. **Empty session** — nothing was completed, so the screen asks whether
 *    to discard instead of reporting zeroes.
 * 3. **Missing session** — the id could not be resolved against the
 *    hand-off or history; the screen says so rather than rendering blanks.
 *
 * The session is read through `useSessionSummary`, which owns the
 * hand-off-vs-history decision and every derived figure. "Done" is the one
 * primary action: it invalidates the sessions query so Home and History
 * refetch, then returns to the top of the Today stack.
 */
import React, { useCallback } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Button } from '@components/Button';
import { EmptyState } from '@components/EmptyState';
import { colors, gutter, spacing, type } from '@theme';
import {
  formatDeltaLabel,
  formatInteger,
  formatLongDateTime,
  formatTonnage,
} from '@lib/format';
import type { TodayStackParamList } from '@/app/navigation/types';

import { PRSection } from '../components/PRSection';
import { StatColumn, StatStrip } from '../components/StatColumn';
import { useSessionSummary } from '../hooks/useSessionSummary';
import { useWorkoutActions } from '../hooks/useWorkoutActions';
import { useLastSessionStore } from '../store';

type Props = NativeStackScreenProps<TodayStackParamList, 'WorkoutSummary'>;

/** Vertical distance between the summary's sections. */
const SECTION_GAP = spacing.xxxl;

/** Gap between the safe area and the top block. */
const CONTENT_TOP = spacing.xxl;

/**
 * Session recap. Its single primary action acknowledges the workout and
 * returns to Today; the empty variant's action discards it instead.
 */
export function WorkoutSummaryScreen({
  navigation,
  route,
}: Props): React.ReactElement {
  const { sessionId } = route.params;
  const { session, minutes, volumeKg, sets, reps, volumeDeltaPercent, personalRecords, isEmpty } =
    useSessionSummary(sessionId);
  const { discard } = useWorkoutActions();
  const clearLastSession = useLastSessionStore((state) => state.clearLastSession);

  const leaveSummary = useCallback((): void => {
    clearLastSession();
    navigation.popToTop();
  }, [clearLastSession, navigation]);

  const handleDiscard = useCallback((): void => {
    discard();
    leaveSummary();
  }, [discard, leaveSummary]);

  if (session === null) {
    return (
      <SummaryShell testID="summary-missing">
        <EmptyState
          action={
            <Button
              label="Back to Today"
              onPress={leaveSummary}
              testID="summary-missing-back"
              variant="secondary"
            />
          }
          message="This session is no longer on this device."
          testID="summary-missing-state"
          title="Session not found"
        />
      </SummaryShell>
    );
  }

  if (isEmpty) {
    return (
      <SummaryShell testID="summary-empty">
        <View style={styles.content}>
          <Text style={styles.overline}>Workout complete</Text>
          <Text style={styles.headline}>Empty workout</Text>
          <Text style={styles.emptyBody}>
            Nothing was logged. Discard this session?
          </Text>
        </View>

        <View style={styles.footer}>
          <Button
            fullWidth
            label="Discard"
            onPress={handleDiscard}
            testID="summary-discard"
            variant="secondary"
          />
          <Button
            label="Keep training"
            onPress={navigation.goBack}
            testID="summary-keep-training"
            variant="text"
          />
        </View>
      </SummaryShell>
    );
  }

  const deltaLabel = formatDeltaLabel(volumeDeltaPercent);
  const isRise = volumeDeltaPercent !== null && volumeDeltaPercent > 0;

  return (
    <SummaryShell testID="summary-recorded">
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        testID="summary-scroll"
      >
        <Text style={styles.overline}>Workout complete</Text>
        <Text style={styles.headline}>{session.routineName || 'Session'}</Text>
        <Text style={styles.meta}>
          {formatLongDateTime(session.startedAt)}
        </Text>

        <View style={styles.hero}>
          <Text style={styles.heroLabel}>Total time</Text>
          <View style={styles.heroValueRow}>
            <Text style={styles.heroValue}>{formatInteger(minutes)}</Text>
            <Text style={styles.heroUnit}>min</Text>
          </View>
        </View>

        <View style={styles.section}>
          <StatStrip>
            <StatColumn
              caption={deltaLabel ?? undefined}
              captionColor={isRise ? colors.success : undefined}
              label="Volume"
              testID="summary-volume"
              value={formatTonnage(volumeKg)}
            />
            <StatColumn
              caption="completed"
              label="Sets"
              testID="summary-sets"
              value={formatInteger(sets)}
            />
            <StatColumn
              caption="total"
              label="Reps"
              testID="summary-reps"
              value={formatInteger(reps)}
            />
          </StatStrip>
        </View>

        {personalRecords.length > 0 ? (
          <View style={styles.section}>
            <PRSection rows={personalRecords} testID="summary-prs" />
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          fullWidth
          label="Done"
          onPress={leaveSummary}
          testID="summary-done"
        />
      </View>
    </SummaryShell>
  );
}

/**
 * Shared chrome: canvas, top safe area, and the bottom inset the pinned
 * footer sits above. Keeps the three variants from repeating the shell.
 */
function SummaryShell({
  children,
  testID,
}: {
  children: React.ReactNode;
  testID?: string;
}): React.ReactElement {
  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.container} testID={testID}>
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  content: {
    paddingTop: CONTENT_TOP,
    paddingBottom: spacing.huge,
    paddingHorizontal: gutter,
  },
  overline: {
    ...type.labelSmall,
    letterSpacing: 0.66,
    textTransform: 'uppercase',
    color: colors.textMuted,
  },
  /** 8px below the overline. */
  headline: {
    ...type.display,
    marginTop: spacing.sm,
    color: colors.textPrimary,
  },
  /** 6px below the headline. */
  meta: {
    ...type.body,
    fontSize: 14,
    marginTop: spacing.xs + 2,
    color: colors.textMuted,
  },
  /** 32px below the top block, per the spec. */
  hero: {
    marginTop: SECTION_GAP,
  },
  heroLabel: {
    ...type.labelSmall,
    letterSpacing: 0.44,
    textTransform: 'uppercase',
    color: colors.textMuted,
  },
  /** 6px below the label. */
  heroValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: spacing.xs + 2,
    gap: spacing.sm,
  },
  heroValue: {
    ...type.metricHero,
    fontVariant: ['tabular-nums'],
    color: colors.textPrimary,
  },
  heroUnit: {
    ...type.metric,
    fontFamily: 'Inter-Medium',
    color: colors.textMuted,
  },
  section: {
    marginTop: SECTION_GAP,
  },
  /** Supporting line for the empty variant, below its headline. */
  emptyBody: {
    ...type.body,
    fontSize: 15,
    marginTop: spacing.md,
    color: colors.textBody,
  },
  /** No hairline: the pinned action is separated by space alone. */
  footer: {
    paddingHorizontal: gutter,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
});
