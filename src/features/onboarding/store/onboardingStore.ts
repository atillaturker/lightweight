/**
 * In-progress onboarding answers.
 *
 * Deliberately NOT persisted — a cold start resets the draft. Each setup
 * screen writes its answer on selection, so the final step can act on the
 * full set without any screen-to-screen parameter passing.
 */
import { create } from 'zustand';

import type { OnboardingDraft, RoutineChoice, TrainingFrequency } from '../types';

/** Default unit — kilograms, matching the domain's storage unit. */
export const DEFAULT_UNIT: OnboardingDraft['unit'] = 'kg';

/** Default frequency — four days, the option the design pre-selects. */
export const DEFAULT_FREQUENCY: TrainingFrequency = '4';

/** Default routine — Upper / Lower, the option the design pre-selects. */
export const DEFAULT_ROUTINE_CHOICE: RoutineChoice = 'upper-lower';

/** Every answer defaults to the pre-selected option on the matching screen. */
const INITIAL_DRAFT: OnboardingDraft = {
  unit: DEFAULT_UNIT,
  frequency: DEFAULT_FREQUENCY,
  routineChoice: DEFAULT_ROUTINE_CHOICE,
};

/** Draft state plus the setters each setup screen calls. */
export interface OnboardingStore extends OnboardingDraft {
  /** Set the display unit chosen on step 1. */
  setUnit: (unit: OnboardingDraft['unit']) => void;
  /** Set the weekly frequency chosen on step 2. */
  setFrequency: (frequency: TrainingFrequency) => void;
  /** Set the first-routine choice made on step 3. */
  setRoutineChoice: (routineChoice: RoutineChoice) => void;
  /** Drop every answer — called when the flow completes or is abandoned. */
  reset: () => void;
}

/**
 * Non-persisted onboarding draft store. Subscribe with a selector, e.g.
 * `useOnboardingStore((s) => s.unit)`.
 */
export const useOnboardingStore = create<OnboardingStore>()((set) => ({
  ...INITIAL_DRAFT,
  setUnit: (unit) => set({ unit }),
  setFrequency: (frequency) => set({ frequency }),
  setRoutineChoice: (routineChoice) => set({ routineChoice }),
  reset: () => set({ ...INITIAL_DRAFT }),
}));
