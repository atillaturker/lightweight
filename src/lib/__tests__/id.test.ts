/**
 * Tests for the identifier helper.
 *
 * This module exists because nanoid's default entry calls the global
 * `crypto`, which Hermes does not provide. The real implementation is
 * exercised here (not mocked) so the `customRandom` wiring cannot silently
 * regress into a runtime-only failure again.
 */
import { createId, ID_LENGTH } from '../id';

describe('createId', () => {
  it('generates an id of the documented length', () => {
    expect(createId()).toHaveLength(ID_LENGTH);
  });

  it('honours a custom size', () => {
    expect(createId(8)).toHaveLength(8);
  });

  it('generates distinct ids', () => {
    const ids = new Set(Array.from({ length: 500 }, () => createId()));

    expect(ids.size).toBe(500);
  });

  it('generates url-safe characters only', () => {
    const id = createId(200);

    expect(id).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it('does not depend on a global crypto object', () => {
    // The bug this module guards against: nanoid's default export reads
    // `crypto.getRandomValues`, which throws a ReferenceError in Hermes.
    const original = (globalThis as { crypto?: unknown }).crypto;
    delete (globalThis as { crypto?: unknown }).crypto;

    try {
      expect(() => createId()).not.toThrow();
      expect(createId()).toHaveLength(ID_LENGTH);
    } finally {
      if (original !== undefined) {
        (globalThis as { crypto?: unknown }).crypto = original;
      }
    }
  });
});
