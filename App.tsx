import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Playground } from "@/_dev";

/**
 * Temporary app shell. The old navigation and auth flow have been
 * moved to src/_legacy/auth for reference. New features will be
 * wired in as they are built.
 */
export default function App() {
  return (
    <SafeAreaProvider>
      {/* TODO: replace with real navigation once features are wired up. */}
      <Playground />
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}
