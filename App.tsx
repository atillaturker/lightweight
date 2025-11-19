import { useFonts } from "expo-font";

import { RootNavigation } from "./src/navigation/rootNavigator";

export default function App() {
  const [loaded, error] = useFonts({
    Inter: require("./assets/fonts/Inter_24pt-Regular.ttf"),
  });

  if (!loaded && !error) {
    return null;
  }
  return <RootNavigation />;
}
