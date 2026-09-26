/**
 * Monoline glyphs used by the training-loop screens.
 *
 * Every icon is drawn with `react-native-svg` on the shared 24-unit grid,
 * 1.5px stroke, round caps — never `@expo/vector-icons`, never a data URI.
 * They live in the feature rather than `@components` because no other
 * feature uses them.
 */
import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

import { colors } from '@theme';

/** Props shared by every glyph: rendered size and stroke color. */
export interface GlyphProps {
  /** Rendered edge length in pixels. */
  size: number;
  /** Stroke color. Defaults to `colors.textPrimary`. */
  color?: string;
}

/** Shared stroke setup for the monoline glyphs. */
const STROKE_WIDTH = 1.5;

/** Calendar outline for the Home header's date action. */
export function CalendarGlyph({
  size,
  color = colors.textPrimary,
}: GlyphProps): React.ReactElement {
  return (
    <Svg
      fill="none"
      height={size}
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={STROKE_WIDTH}
      viewBox="0 0 24 24"
      width={size}
    >
      <Path d="M7 3v3M17 3v3" />
      <Path d="M4 8.5h16" />
      <Path d="M5 5.5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-13a1 1 0 0 1 1-1Z" />
    </Svg>
  );
}

/** Close mark for the Active Workout header. */
export function CloseGlyph({
  size,
  color = colors.textPrimary,
}: GlyphProps): React.ReactElement {
  return (
    <Svg
      fill="none"
      height={size}
      stroke={color}
      strokeLinecap="round"
      strokeWidth={STROKE_WIDTH}
      viewBox="0 0 24 24"
      width={size}
    >
      <Path d="M6 6l12 12M18 6L6 18" />
    </Svg>
  );
}

/** Check mark inside a completed set's check circle. */
export function CheckGlyph({
  size,
  color = colors.textInverse,
}: GlyphProps): React.ReactElement {
  return (
    <Svg
      fill="none"
      height={size}
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      viewBox="0 0 24 24"
      width={size}
    >
      <Path d="M5 12.5l4.5 4.5L19 7.5" />
    </Svg>
  );
}

/** Right chevron on a navigable list row. */
export function ChevronGlyph({
  size,
  color = colors.textMuted,
}: GlyphProps): React.ReactElement {
  return (
    <Svg
      fill="none"
      height={size}
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={STROKE_WIDTH}
      viewBox="0 0 24 24"
      width={size}
    >
      <Path d="M9 6l6 6-6 6" />
    </Svg>
  );
}

/** Overflow "⋯" mark on an exercise block title row. */
export function MoreGlyph({
  size,
  color = colors.textPrimary,
}: GlyphProps): React.ReactElement {
  return (
    <Svg
      fill="none"
      height={size}
      stroke={color}
      strokeWidth={STROKE_WIDTH}
      viewBox="0 0 24 24"
      width={size}
    >
      <Circle cx={5} cy={12} fill={color} r={1.25} stroke="none" />
      <Circle cx={12} cy={12} fill={color} r={1.25} stroke="none" />
      <Circle cx={19} cy={12} fill={color} r={1.25} stroke="none" />
    </Svg>
  );
}
