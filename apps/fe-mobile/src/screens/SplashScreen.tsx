import React, { useEffect, useState } from "react";
import { Alert, Text, View } from "react-native";
import codePush from "react-native-code-push";
import FastImage from "react-native-fast-image";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { Toast } from "react-native-toast-message/lib/src/Toast";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useColorScheme } from "nativewind";
import { twJoin } from "tailwind-merge";

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

function useCodePushUpdate() {
  const updatePackage = useMutation(["code-push"], async () => {
    await codePush.sync({
      installMode: codePush.InstallMode.IMMEDIATE,
    });
  });

  const update = useQuery(
    ["code-push"],
    async () => {
      const update = await codePush.checkForUpdate();

      if (update) {
        return "update_available";
      } else {
        return "no_update";
      }
    },
    {
      onSuccess(result) {
        if (result === "update_available") {
          updatePackage.mutate();
        }
      },
    },
  );

  return update.data === "update_available"
    ? updatePackage.isLoading
      ? "updating"
      : updatePackage.isSuccess
      ? "up_to_date"
      : "update_available"
    : update.isLoading
    ? "loading"
    : "up_to_date";
}

export function SplashScreen() {
  const navigation = useNavigation();
  const [tokenStatus, setTokenStatus] = useState<
    "available" | "not-available"
  >();
  const [codePushTimeout, setCodePushTimeout] = useState(false);

  const codePushUpdate = useCodePushUpdate();

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
    const t = setTimeout(() => {
      setCodePushTimeout(true);
    }, 4000);

    loadAuthToken().then((fetched) =>
      setTokenStatus(fetched ? "available" : "not-available"),
    );

    return () => {
      clearTimeout(t);
    };
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

    if (tokenStatus && (codePushUpdate === "updating" || codePushTimeout)) {
      codePush.disallowRestart();

      setTimeout(() => {
        //For the cases when the app has been opened via push notification deep link,
        if (deepLinkLockState.locked) {
          return;
        }

        if (tokenStatus === "available") {
          navigation.replace(NAVIGATOR_MAIN);
        } else {
          navigation.replace(NAVIGATOR_ONBOARDING);
        }
      }, 1000);
    }
  }, [
    tokenStatus,
    userData.isError,
    userData.isLoading,
    codePushUpdate,
    codePushTimeout,
  ]);

  return (
    <View className="flex-1 items-center justify-center bg-white dark:bg-neutral-1">
      <View className="items-center justify-center space-y-2 pt-3">
        <FastImage
          className="h-36 w-36 rounded-3xl"
          source={require("../../assets/pngs/logo.png")}
        />
        <Text className="font-primary-bold text-neutral-1 dark:text-white text-xl">
          MoviePals
        </Text>
        <Animated.Text
          className={twJoin(
            "font-primary-regular mt-3 text-neutral-2 dark:text-neutral-5 text-base",
            codePushUpdate === "loading" || codePushUpdate === "up_to_date"
              ? "opacity-0"
              : "opacity-100",
          )}
        >
          {codePushUpdate === "loading"
            ? "Checking for updates..."
            : codePushUpdate === "updating"
            ? "Getting an update..."
            : codePushUpdate === "update_available"
            ? "Getting an update..."
            : codePushUpdate === "up_to_date"
            ? "Up to date"
            : null}
        </Animated.Text>
      </View>
    </View>
  );
}
