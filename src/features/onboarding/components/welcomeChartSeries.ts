/**
 * Product-data preview shown on the Welcome screen.
 *
 * These are illustrative 8-week estimated-1RM series — fixed sample data
 * for the first-run preview, not live user data. They are deliberately
 * kept as plain numbers so the chart component stays a pure renderer.
 */

/** One exercise series rendered as a card in the welcome carousel. */
export interface WelcomeChartSeries {
  /** Caption shown on the left, e.g. `Bench Press · Est. 1RM`. */
  caption: string;
  /** Latest value shown on the right, e.g. `102.5 KG`. */
  value: string;
  /** Y-axis labels, top gridline first. */
  yLabels: readonly [string, string, string];
  /** Y of each of the eight weekly points, left to right. */
  points: readonly number[];
}

/**
 * The four cards, in carousel order. Y values are in the chart's own
 * 140px coordinate space, so a larger value is a higher (smaller) y.
 */
export const WELCOME_CHART_SERIES: readonly WelcomeChartSeries[] = [
  {
    caption: 'Bench Press · Est. 1RM',
    value: '102.5 KG',
    yLabels: ['100', '90', '80'],
    // Steady, gradually steepening climb.
    points: [110, 102, 95, 86, 72, 54, 32, 12],
  },
  {
    caption: 'Back Squat · Est. 1RM',
    value: '148.0 KG',
    yLabels: ['150', '135', '120'],
    // Fast early rise, plateau, then a small step up.
    points: [110, 78, 55, 54, 53, 51, 36, 24],
  },
  {
    caption: 'Deadlift · Est. 1RM',
    value: '182.5 KG',
    yLabels: ['190', '170', '150'],
    // Two steps with a flat consolidation between them.
    points: [110, 82, 74, 74, 73, 46, 36, 35],
  },
  {
    caption: 'Overhead Press · Est. 1RM',
    value: '62.5 KG',
    yLabels: ['65', '55', '45'],
    // Slow, tight, consistent rise.
    points: [110, 99, 89, 78, 66, 55, 43, 32],
  },
];

/** X positions of the eight weekly points, shared by every series. */
export const WELCOME_CHART_POINT_X = [
  40, 80, 120, 160, 200, 240, 280, 312,
] as const;

/** Y of the three hairline gridlines, top to bottom. */
export const WELCOME_CHART_GRID_Y = [20, 65, 110] as const;

/** Intrinsic chart size in SVG coordinate space. */
export const WELCOME_CHART_SIZE = { width: 320, height: 140 } as const;

/** Rendered width of a carousel card. */
export const WELCOME_CHART_CARD_WIDTH = WELCOME_CHART_SIZE.width;

/** X-axis ticks: first, middle and last week. */
export const WELCOME_CHART_X_TICKS = [
  { x: 40, label: 'W1' },
  { x: 176, label: 'W4' },
  { x: 312, label: 'W8' },
] as const;
