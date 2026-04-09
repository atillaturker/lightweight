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
  totalVolume?: number; // Calculated as sum of weight * reps for completed sets
}

export interface Workout {
  id: string;
  routineId?: string; // If this Workout has routine
  name: string;
  date: string; // ISO date string
  exercises: WorkoutExercise[];
  status: "active" | "completed" | "discarded";
  duration?: number; // In seconds
  totalVolume?: number; // Total volume (kg)
}

export interface Routine {
  id: string;
  userId: string;
  name: string;
  description?: string;
  exercises: WorkoutExercise[];
  createdAt: string;
  lastPerformed?: string;
  duration?: number; // Estimated duration in seconds
}
