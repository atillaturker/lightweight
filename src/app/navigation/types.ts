/**
 * Navigation param lists. Every navigator and stack declares its routes
 * here so screens can type their props with `NativeStackScreenProps`.
 */

/** Root-level conditional: auth, onboarding, or the main tabs. */
export type RootStackParamList = {
  Auth: undefined;
  Onboarding: undefined;
  Main: undefined;
};

/** Unauthenticated entry point. */
export type AuthStackParamList = {
  SignUp: undefined;
  LogIn: undefined;
};

/** First-run flow, five steps. */
export type OnboardingStackParamList = {
  Intro1: undefined;
  Intro2: undefined;
  SetupUnits: undefined;
  SetupFrequency: undefined;
  SetupRoutine: undefined;
};

/** Bottom tab destinations. Each tab owns a nested native stack. */
export type MainTabParamList = {
  TodayTab: undefined;
  ProgressTab: undefined;
  HistoryTab: undefined;
  ProfileTab: undefined;
};

/** Today tab: daily brief, active session, session summary. */
export type TodayStackParamList = {
  HomeToday: undefined;
  ActiveWorkout: { routineId: string };
  WorkoutSummary: { sessionId: string };
};

/** Progress tab: trends and per-exercise detail. */
export type ProgressStackParamList = {
  Progress: undefined;
  ExerciseDetail: { exerciseId: string };
};

/** History tab: past sessions and their detail views. */
export type HistoryStackParamList = {
  History: undefined;
  SessionDetail: { sessionId: string };
  ExerciseDetailFromHistory: { exerciseId: string };
};

/** Profile tab: account, routines, and the exercise library. */
export type ProfileStackParamList = {
  Profile: undefined;
  Routines: undefined;
  RoutineEditor: { routineId?: string };
  ExercisePicker: { mode: "picker" | "library" };
};
