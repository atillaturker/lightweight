/**
 * Public surface of the routines feature. Other features import from
 * here, never from a path inside the feature.
 */
export type { RoutineTemplateId } from './types';

export { ROUTINES_STORE_KEY, useRoutineStore } from './store';
export type { RoutineStore } from './store';

export { calculatedRoutineMinutes, routineDurationMinutes } from './utils';

export { EXERCISE_LIBRARY, TEMPLATE_EXERCISE_IDS } from './services';

export { RoutineActionSheet } from './components/RoutineActionSheet';
export type { RoutineActionSheetProps } from './components/RoutineActionSheet';
export { RoutineRow } from './components/RoutineRow';
export type { RoutineRowProps } from './components/RoutineRow';

export { ExercisePickerScreen, RoutineEditorScreen, RoutinesScreen } from './screens';
