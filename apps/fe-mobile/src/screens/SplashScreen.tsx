import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import Rive from "rive-react-native";

import { loadAuthToken } from "~/utils/api";
import { useNavigation } from "~/hooks";
import {
  NAVIGATOR_MAIN,
  NAVIGATOR_ONBOARDING,
} from "~/navigators/RootNavigator";

export function SplashScreen() {
  const navigation = useNavigation();
  const [tokenStatus, setTokenStatus] = useState<
    "available" | "not-available"
  >();
  const [animationFinished, setAnimationFinished] = useState(false);

  useEffect(() => {
    loadAuthToken().then((fetched) =>
      setTokenStatus(fetched ? "available" : "not-available")
    );
  }, []);

  useEffect(() => {
    if (animationFinished && tokenStatus) {
      if (tokenStatus === "available") {
        navigation.navigate(NAVIGATOR_MAIN);
      } else {
        navigation.navigate(NAVIGATOR_ONBOARDING);
      }
    }
  }, [animationFinished, tokenStatus]);

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <View className="items-center justify-center space-y-2">
        <View className="h-16 w-16">
          <Rive
            onPause={() => {
              setAnimationFinished(true);
            }}
            resourceName="logo"
          />
        </View>
        <Text className="font-primary-bold text-neutral-1 text-base">
          moviepals
        </Text>
      </View>
    </View>
  );
}
