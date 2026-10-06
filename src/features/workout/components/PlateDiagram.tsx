/**
 * One side of a loaded barbell, drawn from the collar outward: the bar's
 * sleeve as a hairline and each plate as a rounded bar whose height
 * follows its weight. Monochrome — plates use the primary color, never
 * a competition color code.
 */
import React from 'react';
import Svg, { Line, Rect } from 'react-native-svg';

import { useTheme } from '@theme';

/** Drawing height; the heaviest standard plate fills it. */
const HEIGHT = 72;

/** Plate thickness and the gap between plates. */
const PLATE_WIDTH = 12;
const PLATE_GAP = 3;

/** Sleeve stub drawn before the first plate and after the last. */
const SLEEVE = 24;

/** Shortest plate, so 1.25 kg stays visible. */
const MIN_PLATE_HEIGHT = 20;

/** Props for {@link PlateDiagram}. */
export interface PlateDiagramProps {
  /** Plates on one side, heaviest first. */
  plates: number[];
  /** Heaviest plate available, which maps to the full height. */
  maxPlate: number;
  testID?: string;
}

/** Height of a plate, scaled between the minimum and the full height. */
function plateHeight(plate: number, maxPlate: number): number {
  const ratio = Math.min(Math.max(plate / maxPlate, 0), 1);
  return MIN_PLATE_HEIGHT + (HEIGHT - MIN_PLATE_HEIGHT) * ratio;
}

/** The plate drawing for one side of the bar. */
export function PlateDiagram({ plates, maxPlate, testID }: PlateDiagramProps): React.ReactElement {
  const { colors } = useTheme();
  const width = SLEEVE * 2 + plates.length * (PLATE_WIDTH + PLATE_GAP);
  const mid = HEIGHT / 2;
  return (
    <Svg accessibilityElementsHidden height={HEIGHT} testID={testID} width={width}>
      <Line stroke={colors.textMuted} strokeLinecap="round" strokeWidth={4} x1={0} x2={width} y1={mid} y2={mid} />
      {plates.map((plate, index) => {
        const height = plateHeight(plate, maxPlate);
        return (
          <Rect
            fill={colors.primary}
            height={height}
            key={`${plate}-${index}`}
            rx={3}
            width={PLATE_WIDTH}
            x={SLEEVE + index * (PLATE_WIDTH + PLATE_GAP)}
            y={mid - height / 2}
          />
        );
      })}
    </Svg>
  );
}
