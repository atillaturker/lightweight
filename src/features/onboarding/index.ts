/**
 * Public surface of the onboarding feature.
 *
 * The navigation stack imports the screens; nothing outside the feature
 * should need the draft store's internals.
 */
export type {
  OnboardingDraft,
  RoutineChoice,
  RoutineTemplateId,
  TrainingFrequency,
} from './types';

export {
  DEFAULT_FREQUENCY,
  DEFAULT_ROUTINE_CHOICE,
  DEFAULT_UNIT,
  useOnboardingStore,
} from './store/onboardingStore';
export type { OnboardingStore } from './store/onboardingStore';

export { SetupOptionRow, SetupProgress, SetupTopRow, WelcomeChartCard, WelcomeChartCarousel } from './components';
export type { SetupProgressProps, SetupStep, WelcomeChartCardProps, WelcomeChartSeries } from './components';
export { WELCOME_CHART_SERIES } from './components';

export {
  Intro1Screen,
  Intro2Screen,
  SetupFrequencyScreen,
  SetupRoutineScreen,
  SetupUnitsScreen,
  WelcomeScreen,
} from './screens';
