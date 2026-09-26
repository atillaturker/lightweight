/**
 * Onboarding feature types.
 *
 * The draft answers live in `store/onboardingStore.ts` and are intentionally
 * never persisted: onboarding is a one-shot flow, so a cold start discards
 * whatever was half-answered.
 */
import type { WeightUnit } from '@domain/entities';

/** Weekly training-frequency targets offered on setup step 2. */
export type TrainingFrequency = '2-3' | '4' | '5' | '6+';

/** Template IDs that materialise an actual routine on setup step 3. */
export type RoutineTemplateId = 'ppl' | 'upper-lower' | 'full-body';

/** Every setup step 3 answer — a template id, or building one from scratch. */
export type RoutineChoice = RoutineTemplateId | 'scratch';

/** The three answers collected across the setup steps. */
export interface OnboardingDraft {
  /** Display unit, stored as the domain `WeightUnit`. */
  unit: WeightUnit;
  /** Weekly training-frequency target. */
  frequency: TrainingFrequency;
  /** Which first routine to create, or `scratch` for none. */
  routineChoice: RoutineChoice;
}
