import React from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StyleProp,
  ImageStyle,
} from "react-native";
import { DashboardCard } from "./DashboardCard";
export interface WorkoutCardProps {
  title?: string;
  info?: string;
  subTitle?: string;
  image?: {
    uri: string;
    style?: StyleProp<ImageStyle>;
  };
}
}

export const WorkoutCard = ({
  title,
  info,
  subTitle,
  image,
}: WorkoutCardProps) => {
  return (
    <DashboardCard>
      <Image style={image?.style} source={{ uri: image?.uri }}></Image>
      <View style={styles.cardContent}>
        <Text></Text>
        <Text></Text>
        <Text></Text>
        <TouchableOpacity>
          <Text>123</Text>
        </TouchableOpacity>
      </View>
    </DashboardCard>
  );
};

const styles = StyleSheet.create({
  cardContent: {},
});
