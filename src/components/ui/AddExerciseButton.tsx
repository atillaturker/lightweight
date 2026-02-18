import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors, spacing } from "../../theme";

interface AddExerciseButtonProps {
  onPress: () => void;
}

export const AddExerciseButton = ({ onPress }: AddExerciseButtonProps) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.iconWrapper}>
        <Ionicons name="add" size={20} color={colors.brand.primary} />
      </View>
      <Text style={styles.text}>ADD EXERCISE</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background.secondary,
    padding: spacing.l,
    marginHorizontal: spacing.l,
    marginTop: spacing.m,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(19, 127, 236, 0.2)",
    borderStyle: "dashed",
    gap: spacing.s,
  },
  iconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(19, 127, 236, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: colors.brand.primary,
    fontWeight: "700",
    fontSize: 14,
    fontFamily: "Inter",
    letterSpacing: 0.5,
  },
});
