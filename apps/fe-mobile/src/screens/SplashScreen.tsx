import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { Toast } from "react-native-toast-message/lib/src/Toast";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery } from "@tanstack/react-query";
import { useColorScheme } from "nativewind";
import Rive from "rive-react-native";

import { api, loadAuthToken } from "~/utils/api";
import { useNavigation } from "~/hooks";
import {
  NAVIGATOR_MAIN,
  NAVIGATOR_ONBOARDING,
} from "~/navigators/RootNavigator";

function useTheme() {
  const { colorScheme, setColorScheme } = useColorScheme();

  return useQuery(["theme", colorScheme], async () => {
    const r = await AsyncStorage.getItem("theme");
    if (r) {
      setColorScheme(r as any);
    }

    return colorScheme;
  });
}

export function SplashScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const [tokenStatus, setTokenStatus] = useState<
    "available" | "not-available"
  >();
  const [animationFinished, setAnimationFinished] = useState(false);

  const userData = api.user.getMyData.useQuery(undefined, {
    enabled: tokenStatus === "available",
  });

  useEffect(() => {
    loadAuthToken().then((fetched) =>
      setTokenStatus(fetched ? "available" : "not-available"),
    );
  }, []);

  useEffect(() => {
    if (tokenStatus === "available" && userData.isLoading) {
      return;
    }

    if (userData.isError) {
      if (userData.error.data?.code === "NOT_FOUND") {
        return navigation.replace(NAVIGATOR_ONBOARDING);
      } else {
        return Toast.show({
          type: "error",
          text1: "Something went wrong, please try again",
        });
      }
    }

    if (animationFinished && tokenStatus) {
      if (tokenStatus === "available") {
        navigation.replace(NAVIGATOR_MAIN);
      } else {
        navigation.replace(NAVIGATOR_ONBOARDING);
      }
    }
  }, [animationFinished, tokenStatus, userData.isError, userData.isLoading]);

  return (
    <View className="flex-1 items-center justify-center bg-white dark:bg-neutral-1">
      <View className="items-center justify-center space-y-2">
        <View className="h-16 w-16">
          {theme.isSuccess && (
            <Rive
              onPause={() => {
                setAnimationFinished(true);
              }}
              resourceName={theme.data === "dark" ? "logo_light" : "logo"}
            />
          )}
        </View>
        <Text className="font-primary-bold text-neutral-1 dark:text-white text-base">
          moviepals
        </Text>
      </View>
    </View>
  );
}
