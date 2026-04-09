import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { SCREENS } from "../../navigation/screenNames";
import { colors, spacing } from "../../theme";
import { ActivityRow } from "./ActivityRow";

const RecentActivitySection = ({
  history,
  isLoading,
}: {
  history: any[];
  isLoading: boolean;
}) => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  return (
    <>
      <Text
        style={[
          styles.sectionTitle,
          { marginBottom: spacing.m, paddingHorizontal: spacing.xl },
        ]}
      >
        RECENT ACTIVITY
      </Text>
      <View style={styles.activityContainer}>
        {isLoading ? (
          <ActivityIndicator
            size="large"
            color={colors.brand.primary}
            style={{
              marginTop: 20,
              justifyContent: "center",
              alignItems: "center",
            }}
          />
        ) : (
          history.slice(0, 3).map((item) => {
            return (
              <ActivityRow
                key={item.id}
                workout={item}
                onPress={() =>
                  navigation.navigate(SCREENS.WORKOUT_DETAIL, {
                    workoutId: item.id,
                  })
                }
              />
            );
          })
        )}
        {!isLoading && history.length === 0 && (
          <Text style={styles.emptyText}>No recent activity.</Text>
        )}
      </View>
    </>
  );
};

export const styles = StyleSheet.create({
  sectionTitle: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 1,
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

export default RecentActivitySection;
