import React from "react";
import {
  ActivityIndicator,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  ViewStyle,
} from "react-native";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";

interface AppButtonProps extends TouchableOpacityProps {
  title: string;
  isLoading?: boolean;
  icon?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
}

export const AppButton = ({
  title,
  isLoading,
  icon,
  containerStyle,
  ...props
}: AppButtonProps) => {
  return (
    <TouchableOpacity style={[styles.button, containerStyle]} {...props}>
      {isLoading ? (
        <ActivityIndicator
          style={{ margin: spacing.xl }}
          size="small"
          color={colors.text.primary}
        />
      ) : (
        <>
          {icon}
          <Text style={styles.buttonText}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
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
});
