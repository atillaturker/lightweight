import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import StatCard from "../../components/ui/StatCard";
import { authService } from "../../services/firebase";
import { logout, useAppDispatch, useAppSelector } from "../../store";
import { colors, spacing } from "../../theme";

export const HomeScreen = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const handleUserLogout = async () => {
    await authService.logout();
    dispatch(logout());
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        {/* This icon will replaced with the user's profile picture */}
        <Image
          style={styles.image}
          source={
            user?.photoURL
              ? { uri: user.photoURL }
              : require("../../../assets/icon.png")
          }
        />
        <Text style={styles.greetingText}>Hello {user?.displayName}!</Text>
        <TouchableOpacity style={{ justifyContent: "flex-end" }}>
          <Ionicons name="notifications" size={24} />
        </TouchableOpacity>
      </View>
      <View style={styles.statsRow}>
        <StatCard
          label="Workouts this week"
          value="3"
          containerStyle={{ flex: 1 }}
        />
        <StatCard
          label="Total Time"
          value="2h 15m"
          containerStyle={{ flex: 1 }}
        />
      </View>
      <TouchableOpacity onPress={handleUserLogout}>
        <Text>Logout</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.l,
    gap: spacing.l,
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.s,
    marginBottom: spacing.s,
  },
  greetingText: {
    fontSize: 18,
    fontFamily: "Inter",
  },
  image: {
    width: 40,
    height: 40,
  },
  statsRow: {
    flexDirection: "row",
    gap: spacing.l,
  },
});
