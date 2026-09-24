import { useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { colors, spacing } from "../../theme";
import { Routine } from "../../types/workout";
import { calculateDaysAgo, formatDuration } from "../../utils/dateUtils";
import { HorizontalRoutineCard } from "./HorizontalRoutineCard";

interface MyRoutinesSectionProps {
  routines: Routine[];
  onSeeAll: () => void;
  onStartRoutine: ({ item }: { item: Routine }) => void;
}

const MyRoutinesSection = ({
  routines,
  onSeeAll,
  onStartRoutine,
}: MyRoutinesSectionProps) => {
  const renderItem = useCallback(
    ({ item }: { item: Routine }) => (
      <HorizontalRoutineCard
        title={item.name}
        lastPerformed={calculateDaysAgo(item.lastPerformed)}
        exercisesCount={item.exercises?.length || 0}
        duration={formatDuration(item.duration)}
        onStartPress={() => onStartRoutine({ item })}
      />
    ),
    [onStartRoutine],
  );
  return (
    <View style={{ marginBottom: spacing.xl }}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>MY ROUTINES</Text>
        <TouchableOpacity onPress={onSeeAll}>
          <Text style={styles.seeAllText}>SEE ALL</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={routines}
        renderItem={renderItem}
        getItemLayout={(data, index) => ({
          length: 280,
          offset: 280 * index,
          index,
        })}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.routinesScrollContent}
        style={styles.routinesScroll}
        ListEmptyComponent={
          <ActivityIndicator
            size="large"
            color={colors.brand.primary}
            style={{
              marginTop: 20,
              justifyContent: "center",
              alignItems: "center",
            }}
          />
        }
      />
    </View>
  );
};

export default MyRoutinesSection;

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.m,
  },
  sectionTitle: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 1,
  },
  seeAllText: {
    color: "#FACC15",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  routinesScroll: {
    marginBottom: spacing.xl,
  },
  routinesScrollContent: {
    paddingHorizontal: spacing.l,
    gap: spacing.m,
  },
  activityContainer: {
    paddingHorizontal: spacing.l,
  },
  emptyText: {
    color: colors.text.tertiary,
    fontStyle: "italic",
    textAlign: "center",
    marginTop: spacing.s,
    marginBottom: spacing.m,
  },
});
