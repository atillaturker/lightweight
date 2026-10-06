/**
 * Home — the "This week" plan strip, shown once any routine is on the
 * weekly plan.
 *
 * Seven columns, Monday first, in one card: the weekday letter, a status
 * marker, and the planned routine's name. A logged session fills the
 * marker with a check; today's planned session gets an accent ring (a
 * live state); a later planned day has a plain ring; a missed day a dashed
 * hairline ring; a rest day only a small dot. Tapping a day whose session
 * is still ahead or missed opens the move sheet.
 */
import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { Card } from '@components/Card';
import { SectionHeader } from '@components/SectionHeader';
import { fineSpacing, radii, spacing, type, createStyles } from '@theme';
import { formatWeekdayLong } from '@lib/format';

import { isMovable, type WeekPlanDay } from '../utils/weekPlan';

import { CheckGlyph } from './Glyphs';

/** Diameter of a day's status marker. */
const MARKER_SIZE = 32;

/** Diameter of the rest-day dot. */
const REST_DOT_SIZE = 4;

/** Props for {@link HomeWeekPlan}. */
export interface HomeWeekPlanProps {
  days: WeekPlanDay[];
  /** Called with a day whose session can be moved. */
  onPressDay: (day: WeekPlanDay) => void;
  testID?: string;
}

const STATUS_LABEL: Record<WeekPlanDay['status'], string> = {
  done: 'done',
  today: 'planned today',
  missed: 'missed',
  planned: 'planned',
  rest: 'rest',
};

/** One day's marker, by status. */
function Marker({ status }: { status: WeekPlanDay['status'] }): React.ReactElement {
  const styles = useStyles();
  if (status === 'done') {
    return (
      <View style={[styles.marker, styles.markerDone]}>
        <CheckGlyph size={16} />
      </View>
    );
  }
  if (status === 'rest') {
    return (
      <View style={styles.marker}>
        <View style={styles.restDot} />
      </View>
    );
  }
  const variant =
    status === 'today' ? styles.markerToday : status === 'missed' ? styles.markerMissed : styles.markerPlanned;
  return <View style={[styles.marker, variant]} />;
}

/** One column of the strip. */
function DayCell({ day, onPress }: { day: WeekPlanDay; onPress: () => void }): React.ReactElement {
  const styles = useStyles();
  const weekday = formatWeekdayLong(day.date);
  const movable = isMovable(day);
  const label = `${weekday}, ${day.routineName ?? 'rest'}, ${STATUS_LABEL[day.status]}${day.moved ? ', moved' : ''}`;
  return (
    <Pressable
      accessibilityHint={movable ? 'Move this session to another day' : undefined}
      accessibilityLabel={label}
      accessibilityRole={movable ? 'button' : undefined}
      disabled={!movable}
      onPress={onPress}
      style={styles.cell}
      testID={`home-week-plan-day-${new Date(day.date).getDay()}`}
    >
      <Text style={[styles.weekday, day.status === 'today' && styles.weekdayToday]}>
        {weekday.charAt(0)}
      </Text>
      <Marker status={day.status} />
      <Text numberOfLines={1} style={styles.name}>
        {day.routineName ?? ''}
      </Text>
    </Pressable>
  );
}

/** The week's plan at a glance, with the move entry point. */
export function HomeWeekPlan({ days, onPressDay, testID }: HomeWeekPlanProps): React.ReactElement {
  const styles = useStyles();
  return (
    <View testID={testID}>
      <View style={styles.header}>
        <SectionHeader label="This week" variant="rule" />
      </View>
      <View style={styles.cardWrap}>
        <Card>
          <View style={styles.row}>
            {days.map((day) => (
              <DayCell day={day} key={day.date} onPress={() => onPressDay(day)} />
            ))}
          </View>
        </Card>
      </View>
    </View>
  );
}

const useStyles = createStyles((colors) => ({
  header: {
    paddingHorizontal: spacing.xl,
  },
  cardWrap: {
    marginTop: spacing.sm,
    marginHorizontal: spacing.xl,
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    flex: 1,
    alignItems: 'center',
    gap: fineSpacing.stack,
  },
  weekday: {
    ...type.labelSmall,
    color: colors.textMuted,
  },
  weekdayToday: {
    color: colors.textPrimary,
  },
  marker: {
    width: MARKER_SIZE,
    height: MARKER_SIZE,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerDone: {
    backgroundColor: colors.primary,
  },
  markerToday: {
    borderWidth: 1.5,
    borderColor: colors.accent,
  },
  markerPlanned: {
    borderWidth: 1,
    borderColor: colors.textPrimary,
  },
  markerMissed: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.textMuted,
  },
  restDot: {
    width: REST_DOT_SIZE,
    height: REST_DOT_SIZE,
    borderRadius: radii.pill,
    backgroundColor: colors.hairline,
  },
  name: {
    ...type.caption,
    alignSelf: 'stretch',
    textAlign: 'center',
    color: colors.textMuted,
  },
}));
