import React, { useEffect, useState } from "react";
import { Alert, Text, View } from "react-native";
import FastImage from "react-native-fast-image";
import { Toast } from "react-native-toast-message/lib/src/Toast";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery } from "@tanstack/react-query";
import { useColorScheme } from "nativewind";
import Rive from "rive-react-native";

import { api, loadAuthToken } from "~/utils/api";
import { deepLinkLockState } from "~/utils/deep-link-lock";
import { useNavigation } from "~/hooks";
import {
  NAVIGATOR_MAIN,
  NAVIGATOR_ONBOARDING,
} from "~/navigators/RootNavigator";
import { SCREEN_CHECK_INVITE } from "./CheckInviteScreen";
import { SCREEN_ONBOARDING_SEND_INVITE } from "./OnboardingSendInviteScreen";

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

  //Prefetch stuff if possible
  api.user.isPaid.useQuery(undefined, {
    enabled: tokenStatus === "available",
  });

  api.connection.listConnections.useQuery(undefined, {
    enabled: tokenStatus === "available",
  });

  api.connection_requests.countConnectionRequests.useQuery(undefined, {
    enabled: tokenStatus === "available",
  });

  const userData = api.user.getMyData.useQuery(undefined, {
    enabled: tokenStatus === "available",
    onError() {
      return navigation.replace(NAVIGATOR_ONBOARDING);
    },
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
      if (
        userData.error.data?.code === "NOT_FOUND" ||
        userData.error.data?.code === "UNAUTHORIZED"
      ) {
        return navigation.replace(NAVIGATOR_ONBOARDING);
      } else {
        return Toast.show({
          type: "error",
          text1: "Something went wrong, please try again",
        });
      }
    }

    if (tokenStatus) {
      setTimeout(() => {
        //For the cases when the app has been opened via push notification deep link,
        if (deepLinkLockState.locked) {
          return;
        }

        if (tokenStatus === "available") {
          /*
        navigation.replace(NAVIGATOR_ONBOARDING, {
          screen: SCREEN_ONBOARDING_SEND_INVITE,
        });
         * */
          navigation.replace(NAVIGATOR_MAIN);
        } else {
          navigation.replace(NAVIGATOR_ONBOARDING);
        }
      }, 1000);
    }
  }, [tokenStatus, userData.isError, userData.isLoading]);

  return (
    <View className="flex-1 items-center justify-center bg-white dark:bg-neutral-1">
      <View className="items-center justify-center space-y-2">
        <FastImage
          className="h-36 w-36 rounded-3xl"
          source={require("../../assets/pngs/logo.png")}
        />
        <Text className="font-primary-bold text-neutral-1 dark:text-white text-xl">
          MoviePals
        </Text>
      </View>
    </View>
  );
}
