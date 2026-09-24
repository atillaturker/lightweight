import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { colors, spacing } from "../../theme";

interface WorkoutDurationFooterProps {
  onBack: () => void;
  onComplete: () => void;
}

const WorkoutDurationFooter = ({
  onBack,
  onComplete,
}: WorkoutDurationFooterProps) => {
  return (
    <>
      <TouchableOpacity
        style={[styles.modalButton, styles.modalCancelButton]}
        onPress={onBack}
      >
        <Text style={styles.modalCancelButtonText}>Back</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.modalButton, styles.modalFinishButton]}
        onPress={onComplete}
      >
        <Text style={styles.finishButtonText}>Complete</Text>
      </TouchableOpacity>
    </>
  );
};

export default WorkoutDurationFooter;

const styles = StyleSheet.create({
  modalCancelButtonText: {
    color: "#333",
    fontWeight: "600",
    fontSize: 16,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 5,
  },
  modalCancelButton: {
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
  },
  finishButton: {
    backgroundColor: colors.brand.primary,
  },

  finishButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  modalButtonText: {
    fontSize: 16,
    color: "#007AFF",
  },
  modalFinishButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.brand.primary,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: 10,
    gap: 4,
  },
});
