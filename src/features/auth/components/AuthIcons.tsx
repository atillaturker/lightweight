import React from "react";
import Svg, { Circle, Line, Path } from "react-native-svg";

import { colors } from "@theme";

/**
 * Official brand colours for third-party sign-in marks. These are
 * the only hard-coded colours allowed outside @theme — they are
 * brand assets, not design tokens.
 */
const GOOGLE_BLUE = "#4285F4";
const GOOGLE_GREEN = "#34A853";
const GOOGLE_YELLOW = "#FBBC05";
const GOOGLE_RED = "#EA4335";

/** Rendered edge length of the Apple mark inside a secondary button. */
const APPLE_GLYPH_SIZE = 20;

/**
 * Rendered edge length of the Google mark inside a secondary button.
 * Google's circular "G" reads visually larger than Apple's mark, so it
 * is drawn two pixels smaller to balance the two buttons.
 */
const GOOGLE_GLYPH_SIZE = 18;

/** Rendered edge length of the password reveal glyph. */
const EYE_GLYPH_SIZE = 20;

/** Apple mark. Brand asset — conventionally black on light backgrounds. */
const APPLE_PATH =
  "M17.05 12.54c-.02-2.02 1.65-2.99 1.72-3.04-.94-1.37-2.4-1.56-2.92-1.58-1.24-.13-2.42.73-3.05.73-.63 0-1.6-.71-2.63-.69-1.35.02-2.6.79-3.29 2-1.4 2.43-.36 6.04 1 8.01.67.97 1.47 2.06 2.51 2.02 1.01-.04 1.39-.66 2.6-.66 1.22 0 1.56.66 2.63.64 1.08-.02 1.77-.99 2.43-1.96.77-1.12 1.08-2.21 1.1-2.26-.02-.01-2.11-.81-2.13-3.21zM15.03 6.88c.55-.67.93-1.6.83-2.53-.8.03-1.77.53-2.34 1.2-.51.59-.96 1.54-.84 2.45.89.07 1.8-.45 2.35-1.12z";

/**
 * Password reveal glyph. Renders the open eye while the field is masked
 * and the slashed eye while the value is visible.
 */
export function EyeIcon({ hidden }: { hidden: boolean }): React.ReactElement {
  return (
    <Svg
      fill="none"
      height={EYE_GLYPH_SIZE}
      stroke={colors.textMuted}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      viewBox="0 0 24 24"
      width={EYE_GLYPH_SIZE}
    >
      {hidden ? (
        <>
          <Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <Circle cx={12} cy={12} r={3} />
        </>
      ) : (
        <>
          <Path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
          <Path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
          <Line x1={1} y1={1} x2={23} y2={23} />
        </>
      )}
    </Svg>
  );
}

/** Apple provider mark used by the "Continue with Apple" button. */
export function AppleGlyph(): React.ReactElement {
  return (
    <Svg
      height={APPLE_GLYPH_SIZE}
      viewBox="0 0 24 24"
      width={APPLE_GLYPH_SIZE}
    >
      <Path d={APPLE_PATH} fill={colors.textPrimary} />
    </Svg>
  );
}

/**
 * Google provider mark used by the "Continue with Google" button.
 * Renders Google's official four-colour "G", which is a brand asset
 * and therefore exempt from the @theme colour rule.
 */
export function GoogleGlyph(): React.ReactElement {
  return (
    <Svg
      height={GOOGLE_GLYPH_SIZE}
      viewBox="0 0 24 24"
      width={GOOGLE_GLYPH_SIZE}
    >
      <Path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill={GOOGLE_BLUE}
      />
      <Path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill={GOOGLE_GREEN}
      />
      <Path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill={GOOGLE_YELLOW}
      />
      <Path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill={GOOGLE_RED}
      />
    </Svg>
  );
}
