import React from "react";
import { Text, View } from "react-native";

import { Button } from "~/components";
import { useNavigation } from "~/hooks";
import { MainLayout } from "./layouts/MainLayout";

export function ThankYouScreen() {
  const navigation = useNavigation();

  function onSharePremium() {
    //navigation.navigate()
  }

  function onSkip() {
    navigation.goBack();
  }

  return (
    <MainLayout canGoBack title="premium">
      <View className="flex-1">
        <View className="flex-1 space-y-1">
          <Text className="font-primary-bold text-neutral-1 text-2xl">
            Thank you for supporting moviepals ❤️
          </Text>
          <Text className="font-primary-regular text-neutral-2 text-base">
            Now, please go ahead and share some of your awesomeness with 4 other
            people. They can get premium for free (you can always do that later
            from the settings)
          </Text>
        </View>

        <View className="space-y-3">
          <Button onPress={onSharePremium}>share premium</Button>

          <Button kind="outline" onPress={onSkip}>
            skip for now
          </Button>
        </View>
      </View>
    </MainLayout>
  );
}
