/**
 * Acknowledgements — the attribution the third-party data and media
 * licenses require (DESIGN.md §9). Read-only text on the canvas; links
 * open in the browser.
 */
import React from "react";
import { Linking, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { ScreenHeader } from "@components/ScreenHeader";
import { SectionHeader } from "@components/SectionHeader";
import { colors, gutter, spacing, type } from "@theme";

import { ACKNOWLEDGEMENTS, type Acknowledgement } from "../acknowledgements";

import type { ProfileStackParamList } from "@/app/navigation/types";

type Props = NativeStackScreenProps<ProfileStackParamList, "Acknowledgements">;

/** A tappable URL line. */
function LinkLine({ label, url }: { label: string; url: string }): React.ReactElement {
  return (
    <Text
      accessibilityRole="link"
      onPress={() => void Linking.openURL(url)}
      style={styles.link}
    >
      {label}
    </Text>
  );
}

/** One source: what we use, the notice, the license and any changes. */
function AcknowledgementBlock({ item }: { item: Acknowledgement }): React.ReactElement {
  return (
    <View style={styles.block} testID={`acknowledgement-${item.id}`}>
      <SectionHeader label={item.title} variant="rule" />
      <Text style={styles.body}>{item.usage}</Text>
      <Text style={styles.attribution}>{item.attribution}</Text>
      <LinkLine label={item.license} url={item.licenseUrl} />
      <LinkLine label={item.sourceUrl.replace(/^https:\/\//, "")} url={item.sourceUrl} />
      {item.changes ? <Text style={styles.muted}>{`Changes: ${item.changes}`}</Text> : null}
      {item.licenseText ? <Text style={styles.licenseText}>{item.licenseText}</Text> : null}
    </View>
  );
}

/** Attribution for every third-party source the app ships. */
export function AcknowledgementsScreen({ navigation }: Props): React.ReactElement {
  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <ScreenHeader onBack={navigation.goBack} showBack title="Acknowledgements" />
      <ScrollView contentContainerStyle={styles.content}>
        {ACKNOWLEDGEMENTS.map((item) => (
          <AcknowledgementBlock item={item} key={item.id} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas },
  content: { paddingHorizontal: gutter, paddingBottom: spacing.huge },
  block: { marginTop: spacing.xxl, gap: spacing.sm },
  body: { ...type.body, color: colors.textBody },
  attribution: { ...type.body, color: colors.textPrimary },
  link: { ...type.bodySmall, color: colors.textPrimary, textDecorationLine: "underline" },
  muted: { ...type.bodySmall, color: colors.textMuted },
  licenseText: { ...type.caption, color: colors.textMuted },
});
