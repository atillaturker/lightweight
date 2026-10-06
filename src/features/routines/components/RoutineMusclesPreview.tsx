/**
 * Routine editor → "Muscles": what the routine trains, previewed on the
 * body map from each slot's target sets (secondary muscles count half).
 * Display-only. Renders nothing for an empty routine.
 */
import React, { useMemo } from "react";
import { View, useWindowDimensions } from "react-native";

import type { Exercise, RoutineExercise } from "@domain/entities";
import {
  BODY_REGIONS,
  exerciseRegions,
  intensityLevels,
  routineMuscleLoad,
} from "@domain/rules";
import { BODY_REGION_LABELS, BodyMap } from "@components/BodyMap";
import { SectionHeader } from "@components/SectionHeader";
import { createStyles, gutter, spacing } from "@theme";

/** Props for {@link RoutineMusclesPreview}. */
export interface RoutineMusclesPreviewProps {
  slots: RoutineExercise[];
  /** Library lookup, custom exercises included. */
  byId: Map<string, Exercise>;
}

/** Planned muscle load of the routine on the body map. */
export function RoutineMusclesPreview({ slots, byId }: RoutineMusclesPreviewProps): React.ReactElement | null {
  const styles = useStyles();
  const { width } = useWindowDimensions();
  const preview = useMemo(() => {
    const load = routineMuscleLoad(slots, (id) => {
      const exercise = byId.get(id);
      return exercise === undefined ? null : exerciseRegions(exercise);
    });
    const trained = BODY_REGIONS.filter((region) => load[region] > 0);
    return { levels: intensityLevels(load), trained };
  }, [byId, slots]);

  if (preview.trained.length === 0) return null;
  const spoken = `This routine trains: ${preview.trained.map((r) => BODY_REGION_LABELS[r]).join(", ")}`;
  return (
    <View style={styles.section} testID="routine-muscles">
      <SectionHeader label="Muscles" variant="rule" />
      <View style={styles.map}>
        <BodyMap accessibilityLabel={spoken} levels={preview.levels} testID="routine-muscles-map" width={width - gutter * 2} />
      </View>
    </View>
  );
}

const useStyles = createStyles(() => ({
  section: { marginTop: spacing.xxxl },
  map: { marginTop: spacing.lg },
}));
