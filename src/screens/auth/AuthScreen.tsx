import React, { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LoginForm, RegisterForm } from "../../components/auth";
import { colors } from "../../theme/colors";

export const AuthScreen = () => {
  const [activeSegment, setActiveSegment] = useState<string>("login");
  return (
    <View style={styles.container}>
      {/* Fixed Header Section */}
      <View style={styles.headerContainer}>
        <Image
          style={styles.icon}
          source={require("../../../assets/icon.png")}
        />
        <Text style={styles.titleText}>Start Breaking Your Records</Text>
      </View>

      {/* Fixed Segment Control */}
      <View style={styles.segmentControl}>
        <TouchableOpacity
          style={[
            styles.segmentButton,
            {
              backgroundColor:
                activeSegment === "login" ? colors.background.primary : "",
            },
          ]}
          onPress={() => {
            setActiveSegment("login");
          }}
        >
          <Text style={styles.sectionText}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.segmentButton,
            {
              backgroundColor:
                activeSegment === "register" ? colors.background.primary : "",
            },
          ]}
          onPress={() => {
            setActiveSegment("register");
          }}
        >
          <Text style={styles.sectionText}>Register</Text>
        </TouchableOpacity>
      </View>

      {/* Form Content */}
      <View style={styles.formContainer}>
        {activeSegment === "login" ? <LoginForm /> : <RegisterForm />}
      </View>
    </View>
  );
};

// const colors = {
//   backgroundColor: "#101922",
//   textColor: "#FFFFFF",
//   placeHolderColor: "#1F2937",
//   sectionText: "#1D5DB",
//   placeHolderTextColor: "#9CA3AF",
// };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  headerContainer: {
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
  },
  formContainer: {
    flex: 1,
    width: "100%",
  },
  segmentControl: {
    flexDirection: "row",
    backgroundColor: colors.ui.placeholder,
    height: 40,
    padding: 4,
    borderRadius: 8,
    width: "100%",
    marginBottom: 20,
  },
  segmentButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 6,
  },
  titleText: {
    fontFamily: "Inter",
    color: colors.text.primary,
    fontSize: 32,
    fontWeight: "700",
    textAlign: "center",
  },
  sectionText: {
    fontSize: 16,
    fontFamily: "Inter",
    color: colors.text.tertiary,
    textAlign: "center",
    fontWeight: "500",
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 25,
  },
});
