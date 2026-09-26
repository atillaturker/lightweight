/**
 * Navigation param lists. Every navigator and stack declares its routes
 * here so screens can type their props with `NativeStackScreenProps`.
 */

/** Root-level conditional: intro, auth, onboarding, or the main tabs. */
export type RootStackParamList = {
  Intro: undefined;
  Auth: undefined;
  Onboarding: undefined;
  Main: undefined;
};

/** Unauthenticated entry point. Log-in is the default route. */
export type AuthStackParamList = {
  SignUp: undefined;
  LogIn: undefined;
};

/**
 * Pre-auth intro group. Shown before the account screens so the product
 * is explained before the user is asked to sign up.
 */
export type IntroStackParamList = {
  Welcome: undefined;
  Intro1: undefined;
  Intro2: undefined;
};

/** Post-auth first-run setup, three required steps. */
export type OnboardingStackParamList = {
  SetupUnits: undefined;
  SetupFrequency: undefined;
  SetupRoutine: undefined;
};

import type { NavigatorScreenParams } from '@react-navigation/native';

/** Bottom tab destinations. Each tab owns a nested native stack. */
export type MainTabParamList = {
  /**
   * Today tab, addressable down to a nested screen so cross-tab entry
   * points (e.g. Session Detail's "Repeat this workout") can land directly
   * on Active Workout instead of the tab root.
   */
  TodayTab: NavigatorScreenParams<TodayStackParamList> | undefined;
  ProgressTab: undefined;
  HistoryTab: undefined;
  ProfileTab: NavigatorScreenParams<ProfileStackParamList> | undefined;
};

/**
 * Today tab: daily brief, active session, session summary, and the routine
 * stack. Routines are managed from Home, so this tab owns their routes.
 */
export type TodayStackParamList = {
  HomeToday: undefined;
  ActiveWorkout: { routineId: string };
  WorkoutSummary: { sessionId: string };
  Routines: undefined;
  RoutineEditor: { routineId?: string };
  ExercisePicker: {
    mode: "picker" | "library";
    /** Routine the picked exercises are added to, in picker mode. */
    routineId?: string;
    /** Exercise ids the picker should render as already selected. */
    preselectedIds?: string[];
  };
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

/**
 * Profile tab: account and settings. Routines moved to the Today tab, which
 * owns the routine stack.
 */
export type ProfileStackParamList = {
  Profile: undefined;
};
