/**
 * Framework-agnostic display formatters.
 *
 * Every numeric value in a stat strip or set table is rendered through
 * these helpers so the app has exactly one rounding and unit convention.
 * Weights are always stored in kilograms; unit conversion happens at the
 * UI edge. Deliberately dependency-free: the day and month names are
 * hard-coded lookups rather than `Intl` calls, so the output is identical
 * on both platforms and in tests.
 */

const WEEKDAY_SHORT: readonly string[] = [
  'Sun',
  'Mon',
  'Tue',
  'Wed',
  'Thu',
  'Fri',
  'Sat',
];

const WEEKDAY_LONG: readonly string[] = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const MONTH_LONG: readonly string[] = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const MONTH_SHORT: readonly string[] = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

/** Insert thousands separators into a run of digits. */
function groupThousands(digits: string): string {
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/** Round to `decimals` places and drop trailing zeros. */
export function formatDecimal(value: number, decimals = 1): string {
  if (!Number.isFinite(value)) return '0';
  const fixed = value.toFixed(decimals);
  return fixed.replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '');
}

/**
 * Format a number as a grouped integer, e.g. `1440` becomes `1,440`.
 */
export function formatInteger(value: number): string {
  if (!Number.isFinite(value)) return '0';
  const rounded = Math.round(value).toString();
  return rounded.startsWith('-')
    ? `-${groupThousands(rounded.slice(1))}`
    : groupThousands(rounded);
}

/** Format a stored kilogram value without a unit suffix. */
export function formatWeightKg(weightKg: number): string {
  return formatDecimal(weightKg);
}

/**
 * Format a kilogram volume as tonnes once it reaches 1000kg, so weekly
 * totals stay readable: `8400` becomes `8.4t`, `380` becomes `380kg`.
 */
export function formatTonnage(weightKg: number): string {
  if (!Number.isFinite(weightKg) || weightKg <= 0) return '0kg';
  if (weightKg < 1000) return `${formatInteger(weightKg)}kg`;
  return `${formatDecimal(weightKg / 1000)}t`;
}

/** Whole minutes between two timestamps. Never reports less than one. */
export function formatMinutesBetween(
  startedAt: number,
  finishedAt: number | null,
  now: number,
): number {
  const end = finishedAt ?? now;
  return Math.max(1, Math.round((end - startedAt) / 60_000));
}

/** Whole minutes elapsed since a timestamp. Never reports less than one. */
export function formatElapsedMinutes(startedAt: number, now: number): number {
  return Math.max(1, Math.round((now - startedAt) / 60_000));
}

/** Format a duration in seconds as `m:ss`. */
export function formatClock(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/** Short weekday name for a timestamp, e.g. `Tue`. */
export function formatWeekdayShort(timestamp: number): string {
  return WEEKDAY_SHORT[new Date(timestamp).getDay()];
}

/** Month and year for a timestamp, e.g. `April 2026`. */
export function formatMonthYear(timestamp: number): string {
  const date = new Date(timestamp);
  return `${MONTH_LONG[date.getMonth()]} ${date.getFullYear()}`;
}

/** Three-letter month name for a timestamp, e.g. `Apr`. */
export function formatMonthShort(timestamp: number): string {
  return MONTH_SHORT[new Date(timestamp).getMonth()];
}

/** Compact calendar date, e.g. `Apr 2, 2026`. */
export function formatShortDate(timestamp: number): string {
  const date = new Date(timestamp);
  return `${MONTH_SHORT[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

/**
 * Long date and time, e.g. `Tuesday, April 2 · 6:42 PM`.
 */
export function formatLongDateTime(timestamp: number): string {
  const date = new Date(timestamp);
  const hours24 = date.getHours();
  const meridiem = hours24 < 12 ? 'AM' : 'PM';
  const hour12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const day = MONTH_LONG[date.getMonth()];
  return `${WEEKDAY_LONG[date.getDay()]}, ${day} ${date.getDate()} · ${hour12}:${minutes} ${meridiem}`;
}

/**
 * Comparison label for a percentage delta, e.g. `▲ 6%`. Returns `null`
 * when there is no comparison data, so callers hide the line entirely —
 * the delta is never reported as `0` without data.
 */
export function formatDeltaLabel(percent: number | null): string | null {
  if (percent === null || !Number.isFinite(percent)) return null;
  const rounded = Math.round(Math.abs(percent));
  if (rounded === 0) return '0%';
  return `${percent > 0 ? '▲' : '▼'} ${rounded}%`;
}
