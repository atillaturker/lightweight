/**
 * Convert an SVG string to a base64-encoded data URI.
 *
 * Base64 is required for reliable rendering on Android's Image
 * component. UTF-8 data URIs render inconsistently when the SVG
 * contains multiple elements.
 *
 * `react-native-svg` is not compatible with Expo Go ("Can't find
 * ViewManager" errors), so every glyph is authored as an SVG string and
 * handed to a plain `Image` through this helper.
 */
export function svgToDataUri(svg: string): string {
  const utf8 = unescape(encodeURIComponent(svg));
  const base64 =
    typeof globalThis.btoa === "function"
      ? globalThis.btoa(utf8)
      : manualBase64(utf8);
  return `data:image/svg+xml;base64,${base64}`;
}

/**
 * Minimal base64 encoder. Used only as a fallback when btoa is not
 * available in the runtime.
 */
function manualBase64(input: string): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  let output = "";
  let i = 0;
  while (i < input.length) {
    const c1 = input.charCodeAt(i++) & 0xff;
    const c2 = input.charCodeAt(i++) & 0xff;
    const c3 = input.charCodeAt(i++) & 0xff;
    const e1 = c1 >> 2;
    const e2 = ((c1 & 3) << 4) | (c2 >> 4);
    const e3 = ((c2 & 15) << 2) | (c3 >> 6);
    const e4 = c3 & 63;
    output +=
      chars.charAt(e1) +
      chars.charAt(e2) +
      (i > input.length + 1 ? "=" : chars.charAt(e3)) +
      (i > input.length ? "=" : chars.charAt(e4));
  }
  return output;
}

/**
 * Wraps shape markup in a 24x24 viewBox document sized to `size` px.
 * Icons are authored at the 24-unit grid and scaled at render time.
 */
export function svgIcon(size: number, body: string): string {
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"`,
    ` viewBox="0 0 24 24">${body}</svg>`,
  ].join("");
}
