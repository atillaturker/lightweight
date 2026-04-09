import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import StatCard from "../../components/ui/StatCard";
import { authService } from "../../services/firebase";
import { logout, useAppDispatch, useAppSelector } from "../../store";
import { theme } from "../../theme";

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
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons
            name="notifications"
            size={24}
            color={theme.colors.text.primary}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.statsRow}>
        <StatCard
          label="Workouts this week"
          value="3"
          containerStyle={styles.statCard}
        />
        <StatCard
          label="Total Time"
          value="2h 15m"
          containerStyle={styles.statCard}
        />
      </View>
      <TouchableOpacity style={styles.logoutButton} onPress={handleUserLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.l,
    gap: theme.spacing.l,
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.s,
    marginBottom: theme.spacing.s,
  },
  greetingText: {
    fontSize: theme.typography.sizes.l,
    fontFamily: theme.typography.fonts.primary,
    color: theme.colors.text.primary,
    flex: 1,
  },
  image: {
    width: 40,
    height: 40,
    borderRadius: theme.radii.round,
  },
  notificationButton: {
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.xs,
  },
  statsRow: {
    flexDirection: "row",
    gap: theme.spacing.l,
  },
  statCard: {
    flex: 1,
  },
  logoutButton: {
    marginTop: "auto",
    padding: theme.spacing.m,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.radii.m,
    alignItems: "center",
  },
  logoutText: {
    color: theme.colors.semantic.error,
    fontFamily: theme.typography.fonts.primary,
    fontSize: theme.typography.sizes.m,
  },
});
