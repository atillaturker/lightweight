/**
 * Shared rhythm of the Progress sections, so every section header sits
 * in the same row height whether or not it has an action, and content
 * starts the same distance below it.
 */
import { spacing } from '@theme';

/** Height of a section's header row (a 44px tap target when it has an action). */
export const SECTION_HEADER_HEIGHT = 44;

/** Gap between a section header row and the section's first content. */
export const SECTION_CONTENT_GAP = spacing.sm;
