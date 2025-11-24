import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { authService } from "../../services/firebase";
import { logout, useAppDispatch } from "../../store";

export const HomeScreen = () => {
  const dispatch = useAppDispatch();
  const handleGoogleLogout = async () => {
    const response = await authService.logoutGoogle();
    dispatch(logout());
  };
  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={handleGoogleLogout}>
        <Text>Google logout</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
