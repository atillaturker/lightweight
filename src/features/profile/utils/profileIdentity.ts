/**
 * Display helpers for the signed-in identity.
 *
 * The auth store may hold a user with a missing display name or email, so
 * these degrade to an email local-part or a neutral label rather than
 * rendering blank.
 */

/** Name to show: display name, else email local-part, else "Athlete". */
export function displayNameFor(
  name: string | null,
  email: string | null,
): string {
  const trimmedName = name?.trim();
  if (trimmedName) return trimmedName;

  const localPart = email?.split('@')[0]?.trim();
  return localPart ? localPart : 'Athlete';
}

/** One or two uppercase initials for the avatar circle. */
export function initialsFor(name: string | null, email: string | null): string {
  const parts = displayNameFor(name, email).split(/\s+/).filter(Boolean);

  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}
