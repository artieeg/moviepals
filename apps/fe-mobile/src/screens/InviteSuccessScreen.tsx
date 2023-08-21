import React from "react";
import { Text, View } from "react-native";

import { Button } from "~/components";
import { useNavigation } from "~/hooks";
import { MainLayout } from "./layouts/MainLayout";

export const SCREEN_INVITE_SUCCESS = "InviteSuccessScreen";

export function InviteSuccessScreen() {
  const navigation = useNavigation();

  function onSkip() {
    navigation.goBack();
  }

  return (
    <MainLayout canGoBack title="Invites">
      <View className="flex-1">
        <View className="flex-1 space-y-1">
          <Text className="font-primary-bold text-neutral-1 dark:text-white text-2xl">
            Thank you for inviting your friends on the app!
          </Text>
          <Text className="font-primary-regular text-neutral-2 dark:text-neutral-5 text-base">
            Give them some time to join and then you can start swiping together!
          </Text>
        </View>

        <View className="space-y-3">
          <Button onPress={onSkip}>done</Button>
        </View>
      </View>
    </MainLayout>
  );
}
