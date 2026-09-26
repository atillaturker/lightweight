/**
 * Ring chart — a single-ratio progress ring for goal-completion metrics.
 *
 * The design system permits rings only on Welcome, Home / Today, Profile,
 * and the post-workout Summary; see /AGENTS.md → "Ring charts" for the
 * full spec. The component encodes every rule that can be enforced in
 * code: one ring per instance, round caps, 12 o'clock clockwise start, a
 * stroke width derived from the diameter, and a visual fill capped at
 * 96% so the empty track stays perceptible.
 */
import React from "react";
import { Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

import { colors } from "@theme";

import { styles } from "./RingChart.styles";

/**
 * Largest fraction of the circumference the fill may draw, so the track
 * is always visible — even when the value reaches the maximum.
 */
export const RING_MAX_RATIO = 0.96;

/** Diameter at which the heavier 4px stroke takes over. */
const HERO_DIAMETER = 80;

/** Stroke width used on hero rings (>= 80px). */
const HERO_STROKE = 4;

/** Stroke width used on smaller rings (< 80px). */
const COMPACT_STROKE = 3;

/** The only two fill colors a ring may use, per the design system. */
const ALLOWED_FILLS: readonly string[] = [colors.primary, colors.accent];

/** Props for {@link RingChart}. */
export interface RingChartProps {
  /** Current value, 0 to max. */
  value: number;
  /** Maximum value the ring represents. */
  max: number;
  /** Diameter in pixels. Controls stroke width automatically:
   *  >= 80 → 4px stroke, else 3px stroke. */
  size: number;
  /** Optional label rendered inside the ring (e.g. "84%"). */
  centerLabel?: string;
  /** Optional secondary label rendered below the center label. */
  centerSublabel?: string;
  /** Optional color override. Defaults to colors.primary.
   *  Only colors.primary or colors.accent are allowed. */
  color?: string;
  testID?: string;
}

/** Geometry the ring is drawn from. */
export interface RingGeometry {
  /** Radius of the stroke centerline. */
  radius: number;
  /** Stroke width for the given diameter. */
  strokeWidth: number;
  /** Full circumference of the stroke centerline. */
  circumference: number;
  /** Fraction of the circumference the fill draws, capped at 0.96. */
  ratio: number;
  /** Offset applied to the fill's dash pattern. */
  dashOffset: number;
}

/**
 * Resolve the stroke width for a diameter: 4px on hero rings, 3px on
 * everything smaller.
 */
export function calculateRingStrokeWidth(size: number): number {
  return size >= HERO_DIAMETER ? HERO_STROKE : COMPACT_STROKE;
}

/**
 * Clamp a value/max pair into the drawable 0–0.96 range. A non-positive
 * or non-finite maximum yields an empty ring rather than a thrown error,
 * because rings render from possibly-partial data.
 */
export function calculateRingRatio(value: number, max: number): number {
  if (!Number.isFinite(max) || max <= 0 || !Number.isFinite(value)) {
    return 0;
  }
  return Math.min(Math.max(value / max, 0), RING_MAX_RATIO);
}

/**
 * Derive every geometry value the two concentric circles need. Kept pure
 * and exported so tests can assert the cap without pixel assertions.
 */
export function calculateRingGeometry(
  value: number,
  max: number,
  size: number,
): RingGeometry {
  const strokeWidth = calculateRingStrokeWidth(size);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const ratio = calculateRingRatio(value, max);

  return {
    radius,
    strokeWidth,
    circumference,
    ratio,
    dashOffset: circumference * (1 - ratio),
  };
}

/**
 * Single-purpose progress ring. The track is always drawn in full; the
 * fill is overdrawn with a dash pattern derived from the ratio. The
 * number is never implied by the ring alone — callers pass a
 * `centerLabel`, and the ring only ever frames that value.
 */
export function RingChart({
  value,
  max,
  size,
  centerLabel,
  centerSublabel,
  color,
  testID,
}: RingChartProps): React.ReactElement {
  const { radius, strokeWidth, circumference, dashOffset } =
    calculateRingGeometry(value, max, size);

  const fill = color !== undefined && ALLOWED_FILLS.includes(color)
    ? color
    : colors.primary;

  const center = size / 2;
  const svgStyle = { transform: [{ rotate: "-90deg" }] } as const;

  return (
    <View
      accessibilityLabel={centerLabel}
      accessibilityRole="progressbar"
      style={[styles.container, { height: size, width: size }]}
      testID={testID}
    >
      <Svg
        fill="none"
        height={size}
        style={svgStyle}
        testID={testID ? `${testID}-svg` : undefined}
        viewBox={`0 0 ${size} ${size}`}
        width={size}
      >
        <Circle
          cx={center}
          cy={center}
          fill="none"
          r={radius}
          stroke={colors.surface}
          strokeLinecap="round"
          strokeWidth={strokeWidth}
          testID={testID ? `${testID}-track` : undefined}
        />
        <Circle
          cx={center}
          cy={center}
          fill="none"
          r={radius}
          stroke={fill}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          strokeWidth={strokeWidth}
          testID={testID ? `${testID}-fill` : undefined}
        />
      </Svg>

      {centerLabel !== undefined ? (
        <View pointerEvents="none" style={styles.center}>
          <Text style={styles.centerLabel}>{centerLabel}</Text>
          {centerSublabel !== undefined ? (
            <Text style={styles.centerSublabel}>{centerSublabel}</Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
