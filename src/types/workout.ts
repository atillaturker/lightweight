export type MuscleGroup =
  | "chest"
  | "back"
  | "legs"
  | "shoulders"
  | "biceps"
  | "triceps"
  | "abs"
  | "cardio"
  | "other";

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  category?: string; // e.g., "Barbell", "Dumbbell"
}

export interface WorkoutSet {
  id: string;
  weight: number | string; // string to allow temporary empty input "10" or ""
  reps: number | string;
  completed: boolean;
}

export interface WorkoutExercise {
  id: string; // Unique instance ID in the workout
  exerciseId: string; // Reference to the base Exercise
  name: string; // Copied for easier access
  muscleGroup: MuscleGroup;
  category?: string; // e.g., "Barbell", "Dumbbell"
  sets: WorkoutSet[];
  notes?: string;
}

export interface Workout {
  id: string;
  name: string;
  startTime: string; // ISO String
  endTime?: string; // ISO String
  exercises: WorkoutExercise[];
  status: "active" | "completed" | "discarded";
  duration?: number; // In seconds
  volume?: number; // Total volume (kg)
}

// For templates/routines
export interface Routine {
  id: string;
  name: string;
  exercises: { exerciseId: string; setsCount: number }[];
  lastPerformed?: string;
}
