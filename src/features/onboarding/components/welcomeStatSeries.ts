/**
 * Static monthly-preview data for the Welcome screen's stat row.
 *
 * These are illustrative values — fixed sample data for the first-run
 * preview, not live user data. The weekly volume series is expressed as
 * a fraction of the block's plot height so the bars scale with whatever
 * height the layout gives them.
 */

/** Weekly volume bar, one per week, as a fraction of the plot height. */
export interface WelcomeVolumeBar {
  /** Week label, e.g. `W1`. */
  label: string;
  /** Bar height as a fraction (0–1) of the plot area. */
  fraction: number;
}

/** The eight weekly volume bars, in order. */
export const WELCOME_VOLUME_BARS: readonly WelcomeVolumeBar[] = [
  { label: 'W1', fraction: 0.32 },
  { label: 'W2', fraction: 0.38 },
  { label: 'W3', fraction: 0.41 },
  { label: 'W4', fraction: 0.55 },
  { label: 'W5', fraction: 0.62 },
  { label: 'W6', fraction: 0.58 },
  { label: 'W7', fraction: 0.71 },
  { label: 'W8', fraction: 0.78 },
];

/** Total volume figure shown above the bars. */
export const WELCOME_VOLUME_TOTAL = '412.6t';

/** Ring value and maximum for the monthly goal-completion preview. */
export const WELCOME_GOAL_VALUE = 42;

/** Maximum of the monthly goal-completion preview. */
export const WELCOME_GOAL_MAX = 50;

/** Centered label inside the goal ring. */
export const WELCOME_GOAL_LABEL = '84%';

/** Secondary label inside the goal ring. */
export const WELCOME_GOAL_SUBLABEL = 'goal';
