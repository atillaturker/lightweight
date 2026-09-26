/**
 * Sign-up screen.
 *
 * Form-first layout on the pure white canvas: back header, headline,
 * email / password / display-name fields, a neutral strength bar, terms
 * consent, one primary CTA, an "or" divider, provider buttons, and the
 * account switch row. The CTA is disabled until the form is valid, so no
 * invalid request is ever sent.
 */
import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { Button } from "@components/Button";
import { Input } from "@components/Input";
import { ScreenHeader } from "@components/ScreenHeader";

import type { AuthStackParamList } from "@/app/navigation/types";
import {
  AppleGlyph,
  AuthDivider,
  EyeIcon,
  GoogleGlyph,
  PasswordStrengthBar,
  TermsCheckbox,
} from "../components";
import { useSignInActions } from "../hooks/useSignInActions";
import { useAuthStore } from "../store/authStore";
import { calculatePasswordStrength } from "../utils/passwordStrength";
import { styles } from "./authScreen.styles";

/** Validation schema for the sign-up form. */
const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().min(1).max(60),
  termsAccepted: z.literal(true),
});

type SignUpForm = z.infer<typeof signUpSchema>;

/** Initial (empty) form values. */
const EMPTY_SIGN_UP: SignUpForm = {
  email: "",
  password: "",
  displayName: "",
  termsAccepted: false as true,
};

/**
 * Create-account screen. `useSignInActions` owns the request; this screen
 * only renders loading and error state from the auth store.
 */
export function SignUpScreen({
  navigation,
}: NativeStackScreenProps<AuthStackParamList, "SignUp">): React.ReactElement {
  const { signUpEmail, signInGoogle, signInApple } = useSignInActions();
  const status = useAuthStore((state) => state.status);
  const authError = useAuthStore((state) => state.error);

  const [passwordVisible, setPasswordVisible] = useState(false);
  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
    defaultValues: EMPTY_SIGN_UP,
    mode: "onChange",
  });

  const values = watch();
  const strength = useMemo(
    () => calculatePasswordStrength(values.password),
    [values.password],
  );
  const loading = status === "loading";
  const termsChecked = values.termsAccepted === true;

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <ScreenHeader showBack onBack={navigation.goBack} />

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.headline}>Create your account</Text>
        <Text style={styles.supporting}>
          Your training history stays in sync across devices.
        </Text>

        <View style={styles.form}>
          <Input
            label="Email"
            placeholder="you@example.com"
            autoCapitalize="none"
            autoComplete="email"
            error={errors.email?.message}
            keyboardType="email-address"
            onChangeText={(value) =>
              setValue("email", value, { shouldValidate: true })
            }
            testID="signup-email"
            value={values.email}
          />

          <View style={styles.fieldGap}>
            <Input
              label="Password"
              placeholder="••••••••"
              autoCapitalize="none"
              autoComplete="new-password"
              error={errors.password?.message}
              onChangeText={(value) =>
                setValue("password", value, { shouldValidate: true })
              }
              rightAccessory={
                <Pressable
                  accessibilityLabel={
                    passwordVisible ? "Hide password" : "Show password"
                  }
                  accessibilityRole="button"
                  onPress={() => setPasswordVisible((visible) => !visible)}
                  testID="signup-password-toggle"
                >
                  <EyeIcon hidden={!passwordVisible} />
                </Pressable>
              }
              secureTextEntry={!passwordVisible}
              testID="signup-password"
              value={values.password}
            />
            <View style={styles.strength}>
              <PasswordStrengthBar
                strength={strength}
                testID="signup-strength"
              />
            </View>
          </View>

          <View style={styles.fieldGap}>
            <Input
              label="Display name"
              placeholder="Atilla TURKER"
              autoCapitalize="words"
              autoComplete="name"
              error={errors.displayName?.message}
              onChangeText={(value) =>
                setValue("displayName", value, { shouldValidate: true })
              }
              testID="signup-display-name"
              value={values.displayName}
            />
          </View>
        </View>

        <View style={styles.terms}>
          <TermsCheckbox
            checked={termsChecked}
            error={
              errors.termsAccepted ? "Accept the terms to continue." : undefined
            }
            onToggle={() =>
              setValue("termsAccepted", !termsChecked as true, {
                shouldValidate: true,
              })
            }
            testID="signup-terms"
          />
        </View>

        {authError ? <Text style={styles.inlineError}>{authError}</Text> : null}

        <View style={styles.cta}>
          <Button
            fullWidth
            label="Create account"
            loading={loading}
            onPress={handleSubmit(
              (form) =>
                void signUpEmail({
                  email: form.email,
                  password: form.password,
                  displayName: form.displayName,
                }),
            )}
            testID="signup-submit"
          />
        </View>

        <View style={styles.divider}>
          <AuthDivider />
        </View>

        <View style={styles.providerGap}>
          <Button
            fullWidth
            icon={<GoogleGlyph />}
            label="Continue with Google"
            onPress={() => void signInGoogle()}
            variant="secondary"
          />
        </View>

        <View style={styles.providers}>
          <Button
            fullWidth
            icon={<AppleGlyph />}
            label="Continue with Apple"
            onPress={() => void signInApple()}
            variant="secondary"
          />
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>
            Already have an account?{" "}
            <Text
              accessibilityRole="link"
              onPress={() => navigation.navigate("LogIn")}
              style={styles.switchAction}
            >
              Log in
            </Text>
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
