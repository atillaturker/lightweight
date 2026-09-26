/**
 * Public surface of the workout feature.
 *
 * The navigation stack imports the screens; nothing outside the feature
 * needs the stores, hooks, or preview data. The data providers are
 * exported because a later library/analytics batch registers the real
 * sources through them.
 */
export {
  ActiveWorkoutScreen,
  HomeTodayScreen,
  WorkoutSummaryScreen,
} from './screens';
export type { ActiveWorkoutScreenProps } from './screens';

export {
  ExerciseBlock,
  MoreGlyph,
  PRSection,
  SetRow,
  StatColumn,
  StatStrip,
} from './components';
export type {
  ExerciseBlockProps,
  PRSectionProps,
  SetRowProps,
  StatColumnProps,
} from './components';

export { summarizeSessionPRs } from './utils';
export type { PRSummaryRow } from './utils';

export {
  getExerciseHistory,
  getExerciseLibrary,
  getSessionHistory,
  getWeightUnit,
  recordSession,
  resetSessionDataProviders,
  setExerciseHistoryProvider,
  setExerciseLibraryProvider,
  setSessionHistoryProvider,
  setSessionRecorder,
  setWeightUnitProvider,
} from './services';
export type {
  ExerciseHistoryProvider,
  ExerciseLibraryProvider,
  SessionHistoryProvider,
  SessionRecorderProvider,
  WeightUnitProvider,
} from './services';

export { useActiveWorkout, useRestTimer, useSetLogger, useWorkoutActions } from './hooks';
export type {
  SetLoggerActions,
  UseActiveWorkoutResult,
  UseRestTimerResult,
  WorkoutActions,
} from './hooks';

export { useActiveWorkoutStore, useLastSessionStore } from './store';
export type { ActiveWorkoutState, LastSessionState } from './store';
export type { ActiveExercise, ActiveSet, ActiveWorkoutPreview, FocusedCell } from './types';
