import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import { StyleSheet, View } from "react-native";
import { useAuthActions } from "../../hooks";
import { RegisterFormData, registerSchema } from "../../schemas/authScemas";
import { useAppSelector } from "../../store";
import { colors } from "../../theme/colors";
import { AppButton } from "../ui/AppButton";
import { ControlledAppInput } from "../ui/ControlledAppInput";

export const RegisterForm = () => {
  const { isLoading } = useAppSelector((state) => state.auth);
  // This form state will be used to capture user input
  const { handleSubmit, control } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });
  const { handleRegisterWithEmailAndPassword } = useAuthActions();
  return (
    <View style={styles.container}>
      <ControlledAppInput
        name={"username"}
        control={control}
        label="Username"
        placeholder="Enter your username"
        containerStyle={styles.inputContainerStyle}
        autoCapitalize="none"
        keyboardType="default"
      />

      <ControlledAppInput
        name={"email"}
        control={control}
        label="Email Address"
        placeholder="Enter your email"
        containerStyle={styles.inputContainerStyle}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <ControlledAppInput
        name={"password"}
        control={control}
        label="Password"
        placeholder="Enter your password"
        containerStyle={styles.inputContainerStyle}
        secureTextEntry
        autoCapitalize="none"
      />
      <ControlledAppInput
        name={"confirmPassword"}
        control={control}
        label="Confirm Password"
        placeholder="Re-enter your password"
        containerStyle={styles.inputContainerStyle}
        secureTextEntry
        autoCapitalize="none"
      />
      <AppButton
        title="Create Account"
        containerStyle={{
          opacity: isLoading ? 0.7 : 1,
          backgroundColor: colors.brand.primary,
        }}
        disabled={isLoading}
        onPress={handleSubmit(
          (data) =>
            handleRegisterWithEmailAndPassword(
              data.email,
              data.username,
              data.password
            ),
          (errors) => {
            console.log("Form Errors:", errors);
          }
        )}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  inputContainerStyle: {
    marginBottom: 20,
  },
});
