import React, { useEffect } from "react";
import { StatusBar } from "react-native";
import Toast from "react-native-toast-message";
import { NavigationContainer } from "@react-navigation/native";
import { IconoirProvider } from "iconoir-react-native";

import RootNavigator from "./navigators/RootNavigator";
import { TRPCProvider } from "./utils/api";
import {Platform} from "react-native";

export function App() {
  useEffect(() => {
    StatusBar.setBarStyle("dark-content");

    if (Platform.OS === "android") {
      StatusBar.setTranslucent(true);
    }
  }, []);

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
      <Toast />
    </TRPCProvider>
  );
}
