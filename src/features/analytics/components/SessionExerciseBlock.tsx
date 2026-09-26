/**
 * One read-only exercise block of the Session Detail table.
 *
 * Wraps the workout feature's {@link ExerciseBlock} in its `readOnly`
 * variant so the session-detail table and the live logging table stay the
 * same component. The interactive handlers are stubbed because the
 * read-only block renders no tap targets.
 */
import React from 'react';

import { formatInteger, formatWeightKg } from '@lib/format';
import type { FocusedCell } from '@features/workout';
import { ExerciseBlock } from '@features/workout';

import type { SessionExerciseBlockModel } from '../utils';

/** No-op for the interactive props the read-only block ignores. */
function noop(): void {
  return undefined;
}

/** Format a numeric cell for display; a record owns the value, not a draft. */
function displayValue(cell: FocusedCell, actual: number): string {
  return cell.field === 'weight' ? formatWeightKg(actual) : formatInteger(actual);
}

/** Props for {@link SessionExerciseBlock}. */
export interface SessionExerciseBlockProps {
  block: SessionExerciseBlockModel;
  /** Opens the exercise's analytics when the name row is tapped. */
  onPress?: () => void;
  testID?: string;
}

/**
 * Static exercise block: name, right-aligned summary, and a set table with
 * neutral outline set numbers. No overflow action and no "Add set"; the
 * name row is the tap target when `onPress` is supplied.
 */
export function SessionExerciseBlock({
  block,
  onPress,
  testID,
}: SessionExerciseBlockProps): React.ReactElement {
  return (
    <ExerciseBlock
      activeSetId={null}
      displayValue={displayValue}
      exercise={block.exercise}
      focusedCell={null}
      lastTimeLine={null}
      onAddSet={noop}
      onFocusCell={noop}
      onPressHeader={onPress}
      onPressMore={noop}
      onToggleComplete={noop}
      readOnly
      registerRowRef={noop}
      summary={block.summary}
      testID={testID}
    />
  );
}
