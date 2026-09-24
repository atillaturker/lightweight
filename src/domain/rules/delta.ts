/**
 * Percent change from previous to current.
 * Returns null when previous is 0 or negative — the UI hides the delta
 * line on null rather than showing "0%" or "—".
 */
export function calculateDelta(
  current: number,
  previous: number,
): number | null {
  if (previous <= 0) {
    return null;
  }
  return ((current - previous) / previous) * 100;
}
