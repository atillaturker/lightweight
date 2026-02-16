import { useFonts } from "expo-font";

import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import { RootNavigation } from "./src/navigation/rootNavigator";
import { store } from "./src/store";

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [loaded, error] = useFonts({
    Inter: require("./assets/fonts/Inter_24pt-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <RootNavigation />
      </Provider>
    </SafeAreaProvider>
  );
}
