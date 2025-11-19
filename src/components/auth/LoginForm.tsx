import React from "react";
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export const LoginForm = () => {
  return (
    <View>
      <View style={styles.loginSection}>
        <View style={styles.inputContainer}>
          <Text style={styles.labelText}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor={colors.placeHolderTextColor}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.labelText}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            placeholderTextColor={colors.placeHolderTextColor}
            secureTextEntry
          />
        </View>

        <Text style={styles.forgetPasswordText}>Forgot your Password?</Text>
        <TouchableOpacity style={styles.button} onPress={() => {}}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.otherLogin}>Or login with</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity style={styles.googleLoginButton} onPress={() => {}}>
          {/* These icons are placeholders. They should be replaced with actual icons. */}
          <Image
            source={require("../../../assets/icon.png")}
            style={{ width: 24, height: 24, marginRight: 8 }}
          />
          <Text style={styles.buttonText}>Login with Google</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.googleLoginButton} onPress={() => {}}>
          <Image
            source={require("../../../assets/icon.png")}
            style={{ width: 24, height: 24, marginRight: 8 }}
          />
          <Text style={styles.buttonText}>Login with Apple</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const colors = {
  backgroundColor: "#101922",
  textColor: "#FFFFFF",
  placeHolderColor: "#1F2937",
  sectionText: "#1D5DB",
  placeHolderTextColor: "#6B7281",
  inputBackgroundColor: "#18212D",
  buttonBackgroundColor: "#137FEC",
  forgetPasswordTextColor: "#137FEC",
  borderColor: "#374151",
  dividerColor: "#374151",
};

const styles = StyleSheet.create({
  loginSection: {
    width: "100%",
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    height: 48,
    paddingHorizontal: 12,
    backgroundColor: colors.inputBackgroundColor,
    color: "#6B7281",
    fontSize: 16,
    fontFamily: "Inter",
    borderWidth: 1,
    borderRadius: 8,
    borderColor: colors.borderColor,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.dividerColor,
  },
  labelText: {
    color: colors.textColor,
    fontSize: 16,
    fontFamily: "Inter",
    marginBottom: 10,
  },
  inputText: {
    color: colors.textColor,
    fontSize: 16,
    fontFamily: "Inter",
    paddingHorizontal: 12,
  },
  button: {
    backgroundColor: colors.buttonBackgroundColor,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    height: 48,
  },
  buttonText: {
    color: colors.textColor,
    fontSize: 16,
    fontFamily: "Inter",
  },
  forgetPasswordText: {
    color: colors.forgetPasswordTextColor,
    fontSize: 14,
    fontFamily: "Inter",
    textAlign: "right",
    marginBottom: 12,
  },
  otherLogin: {
    textAlign: "center",
    color: colors.placeHolderTextColor,
    fontSize: 14,
    fontFamily: "Inter",
    paddingHorizontal: 12,
  },
  googleLoginButton: {
    flexDirection: "row",
    backgroundColor: colors.backgroundColor,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.borderColor,
    gap: 8,
    height: 48,
  },
});
