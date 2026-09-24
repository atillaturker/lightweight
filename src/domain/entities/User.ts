/**
 * Display unit for weights. Storage is always kilograms.
 */
export type WeightUnit = 'kg' | 'lb';

/**
 * Which day starts an analytics week.
 */
export type WeekStart = 'monday' | 'sunday';

/**
 * User-configurable app preferences.
 */
export interface UserPreferences {
  unit: WeightUnit;
  weekStart: WeekStart;
  rpeEnabled: boolean;
  restTimerSeconds: number;
  notificationsEnabled: boolean;
}

/**
 * The authenticated user.
 */
export interface User {
  id: string;
  email: string;
  displayName: string;
  preferences: UserPreferences;
  hasOnboarded: boolean;
  createdAt: number;
}
