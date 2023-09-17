import React, { useEffect } from "react";
import { Platform, StatusBar } from "react-native";
import codePush from "react-native-code-push";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import Toast, { BaseToast } from "react-native-toast-message";
import { LinkingOptions, NavigationContainer } from "@react-navigation/native";
import { IconoirProvider } from "iconoir-react-native";
import { useColorScheme } from "nativewind";

import {
  NAVIGATOR_FRIENDS,
  NAVIGATOR_MATCHES,
  NAVIGATOR_SWIPE,
} from "./navigators/MainNavigator";
import RootNavigator, { NAVIGATOR_MAIN } from "./navigators/RootNavigator";
import { SCREEN_FEEDBACK, SCREEN_INVITE } from "./screens";
import { loadAuthToken, TRPCProvider } from "./utils/api";

function AppContent() {
  const { top } = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();

  useEffect(() => {
    loadAuthToken();

    StatusBar.setBarStyle(
      colorScheme === "dark" ? "light-content" : "dark-content",
    );

    if (Platform.OS === "android") {
      StatusBar.setTranslucent(true);
      StatusBar.setBackgroundColor("transparent");
    }
  }, [colorScheme]);

  const linking: LinkingOptions<any> = {
    prefixes: ["moviepals://", "https://moviepals.io/"],
    config: {
      initialRouteName: NAVIGATOR_MAIN,
      screens: {
        [SCREEN_INVITE]: {
          path: "invite",
        },
        [SCREEN_FEEDBACK]: {
          path: "feedback",
        },
        [NAVIGATOR_MAIN]: {
          screens: {
            [NAVIGATOR_FRIENDS]: {
              path: "friends",
            },
            [NAVIGATOR_SWIPE]: {
              path: "swipe",
            },
            [NAVIGATOR_MATCHES]: {
              path: "view-matches",
            },
          },
        },
      },
    },
  };

  return (
    <TRPCProvider>
      <IconoirProvider
        iconProps={{
          width: 32,
          height: 32,
          strokeWidth: 2,
          color: colorScheme === "dark" ? "#FFFFFF" : "#0E0C10",
        }}
      >
        <NavigationContainer linking={linking}>
          <RootNavigator />
        </NavigationContainer>
      </IconoirProvider>
      <Toast
        topOffset={top + 12}
        config={{
          error: (props) => {
            return (
              <BaseToast
                {...props}
                style={{ borderLeftColor: "#FC7B71" }}
                contentContainerStyle={{ paddingHorizontal: 15 }}
                text2Style={{
                  fontFamily: "Poppins-Medium",
                  fontSize: 14,
                  color: "#71707B",
                }}
                text1Style={{
                  fontFamily: "Montserrat-Bold",
                  color: "#0E0C10",
                  fontSize: 16,
                  marginBottom: 4,
                }}
              />
            );
          },
        }}
      />
    </TRPCProvider>
  );
}

function AppContainer({ isHeadless }: { isHeadless?: boolean }) {
  if (isHeadless) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}
export const App = codePush({
  checkFrequency: codePush.CheckFrequency.MANUAL,
  installMode: codePush.InstallMode.IMMEDIATE,
})(AppContainer);
