import React from "react";
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { colors } from "../../theme/colors";

export const LoginForm = () => {
  return (
    <View>
      <View style={styles.loginSection}>
        <View style={styles.inputContainer}>
          <Text style={styles.labelText}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor={colors.text.tertiary}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.labelText}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            placeholderTextColor={colors.text.tertiary}
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
            style={{ width: 24, height: 24, marginRight: 8 }}
            source={require("../../../assets/icon.png")}
          />
          <Text style={styles.buttonText}>Login with Google</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.appleLoginButton} onPress={() => {}}>
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
    backgroundColor: colors.background.tertiary,
    color: "#6B7281",
    fontSize: 16,
    fontFamily: "Inter",
    borderWidth: 1,
    borderRadius: 8,
    borderColor: colors.ui.border,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.ui.border,
  },
  labelText: {
    color: colors.text.primary,
    fontSize: 16,
    fontFamily: "Inter",
    marginBottom: 10,
  },
  inputText: {
    color: colors.text.primary,
    fontSize: 16,
    fontFamily: "Inter",
    paddingHorizontal: 12,
  },
  button: {
    backgroundColor: colors.brand.primary,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    height: 48,
  },
  buttonText: {
    color: colors.text.primary,
    fontSize: 16,
    fontFamily: "Inter",
  },
  forgetPasswordText: {
    color: colors.brand.primary,
    fontSize: 14,
    fontFamily: "Inter",
    textAlign: "right",
    marginBottom: 12,
  },
  otherLogin: {
    textAlign: "center",
    color: colors.text.tertiary,
    fontSize: 14,
    fontFamily: "Inter",
    paddingHorizontal: 12,
  },
  googleLoginButton: {
    flexDirection: "row",
    backgroundColor: colors.background.primary,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.ui.border,
    gap: 8,
    height: 48,
  },
  appleLoginButton: {
    flexDirection: "row",
    backgroundColor: colors.background.primary,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.ui.border,
    gap: 8,
    height: 48,
    paddingRight: 12,
  },
});
