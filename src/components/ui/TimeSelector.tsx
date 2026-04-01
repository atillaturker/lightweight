import React from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { colors } from "../../theme";

export type timeSelectorProps = {
  data: number[];
  selected: number;
  onSelect: (value: number) => void;
  label: string;
};

const TimeSelector = ({
  data,
  selected,
  onSelect,
  label,
}: timeSelectorProps) => {
  return (
    <View style={styles.selectorContainer}>
      <Text style={styles.selectorTitle}>{label}</Text>
      <View style={styles.listWrapper}>
        <FlatList
          data={data}
          keyExtractor={(item) => item.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 10 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.timeOption]}
              onPress={() => onSelect(item)}
            >
              <Text
                style={[
                  styles.timeText,
                  item === selected && styles.timeTextSelected,
                ]}
              >
                {item.toString().padStart(2, "0")}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </View>
  );
};

export default TimeSelector;

const styles = StyleSheet.create({
  selectorContainer: {
    flex: 1,
    alignItems: "center",
    overflow: "hidden",
    backgroundColor: colors.background.primary,
  },
  listWrapper: {
    flex: 1,
    width: "100%",
  },
  selectorTitle: {
    color: colors.text.secondary,
    fontSize: 12,
    fontWeight: "500",
    fontFamily: "Inter",
    marginBottom: 4,
    textAlign: "center",
  },
  timeOption: {
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  timeText: {
    fontSize: 18,
    color: colors.text.primary,
  },
  timeTextSelected: {
    fontWeight: "bold",
    color: colors.brand.primary,
  },
});
