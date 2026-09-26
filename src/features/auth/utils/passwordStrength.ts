/**
 * Password strength scoring.
 *
 * Deliberately monotone: the score only drives how much of the neutral
 * strength bar is filled. It never selects a colour, so a weak password
 * is never rendered as "bad" in red/green terms.
 */

/** Predicates that each contribute an equal share of the score. */
const CRITERIA: ReadonlyArray<(password: string) => boolean> = [
  (password) => password.length >= 8,
  (password) => /[a-z]/.test(password),
  (password) => /[A-Z]/.test(password),
  (password) => /\d/.test(password),
  (password) => /[^A-Za-z0-9]/.test(password),
];

/**
 * Score a password as a fraction between 0 and 1.
 *
 * An empty string scores 0; every additional satisfied criterion adds an
 * equal share, so the value is always in `[0, 1]`.
 */
export function calculatePasswordStrength(password: string): number {
  if (password.length === 0) return 0;

  const met = CRITERIA.filter((matches) => matches(password)).length;
  return met / CRITERIA.length;
}
