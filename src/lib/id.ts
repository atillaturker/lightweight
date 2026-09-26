/**
 * Identifier generation.
 *
 * IDs are produced by `nanoid`'s `customRandom`, with an explicit random
 * source. The default `nanoid()` export cannot be used here: under React
 * Native, package `exports` resolves the `react-native` condition to
 * `index.browser.js`, whose generator calls the bare global
 * `crypto.getRandomValues`. Hermes ships no Web Crypto and no crypto
 * polyfill is installed, so that call throws
 * `ReferenceError: Property 'crypto' doesn't exist` at the first ID.
 *
 * `customRandom` is the same generator with the entropy source injected,
 * and it is identical in every build of the package — so this module is
 * stable across Node (tests) and the app runtime.
 *
 * These IDs identify local rows (sets, sessions, queued mutations). They
 * are not secrets, and a 21-character id over a 64-symbol alphabet has
 * collision odds far below the risk they are guarding against, so
 * `Math.random` is an adequate source here.
 */
import { customRandom, urlAlphabet } from 'nanoid';

/** Characters per generated id, matching nanoid's default. */
export const ID_LENGTH = 21;

/** Bytes drawn per id before masking into the alphabet. */
const BYTE_RANGE = 256;

/**
 * Fill a byte buffer from `Math.random`.
 *
 * `nanoid` masks each byte against the alphabet length, so the bytes only
 * need a uniform 0-255 distribution — they are not required to be
 * cryptographically strong.
 */
function randomBytes(bytes: number): Uint8Array {
  const buffer = new Uint8Array(bytes);
  for (let index = 0; index < bytes; index += 1) {
    buffer[index] = Math.floor(Math.random() * BYTE_RANGE);
  }
  return buffer;
}

/**
 * Generate a URL-safe identifier, e.g. `V1StGXR8_Z5jdHi6B-myT`.
 *
 * @param size Characters to generate. Defaults to {@link ID_LENGTH}.
 */
export const createId = customRandom(urlAlphabet, ID_LENGTH, randomBytes);
