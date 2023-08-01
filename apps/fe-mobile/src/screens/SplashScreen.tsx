import { useNavigation } from "~/hooks";
import { NAVIGATOR_ONBOARDING } from "~/navigators/RootNavigator";
import React from "react";
import { Text, View } from "react-native";
import Rive from "rive-react-native";

export function SplashScreen() {
  const navigation = useNavigation();

  return (
    <View className="flex-1 items-center justify-center">
      <View className="items-center justify-center space-y-2">
        <View className="w-16 h-16">
          <Rive
            onPause={() => {
              navigation.navigate(NAVIGATOR_ONBOARDING);
            }}
            resourceName="logo"
          />
        </View>
        <Text className="font-primary-bold text-base text-neutral-1">
          moviepals
        </Text>
      </View>
    </View>
  );
}
