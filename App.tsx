import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";

import { NavigationRoot } from "@/app/navigation";
import { registerDataProviders } from "@/app/providers";
import { registerCloudSync } from "@/app/providers/cloudSync";
import { CloudSync } from "@/app/providers/useCloudSync";
import { registerUserScope } from "@/app/providers/userScope";

// Scope user-owned stores to the signed-in account before anything reads
// them, so one account never sees or writes another's data.
registerUserScope();
// Wire the workout feature's data seams to their real sources before the
// first screen renders. Idempotent, so a fast-refresh remount is safe.
registerDataProviders();
// Point the local stores at Firestore and start the reconnect listener.
registerCloudSync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <CloudSync />
          <NavigationRoot />
          <StatusBar style="auto" />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
