import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { IconoirProvider } from "iconoir-react-native";

import RootNavigator from "./navigators/RootNavigator";
import { TRPCProvider } from "./utils/api";

export function App() {
  return (
    <TRPCProvider>
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
    </TRPCProvider>
  );
}
