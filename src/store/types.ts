import { Exercise, Routine, Workout } from "../types/workout";

export interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  // Add other user-related fields as necessary
}

export interface authState {
  isAuthenticated: boolean;
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  user: UserData | null;
}

export interface WorkoutState {
  activeWorkout: Workout | null;
  history: Workout[];
  routines: Routine[];
  availableExercises: Exercise[];
  isLoading: boolean;
  error: string | null;
  draftRoutine: Partial<Routine> | null;
}
