import { NavigationContainer } from "@react-navigation/native";
import { IconoirProvider } from "iconoir-react-native";
import React from "react";
import RootNavigator from "./navigators/RootNavigator";

export function App() {
  return (
    <IconoirProvider
      iconProps={{
        width: 32,
        height: 32,
        strokeWidth: 2,
        color: "#0E0C10",
      }}
    >
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </IconoirProvider>
  );
}
