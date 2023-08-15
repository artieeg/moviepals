import React from "react";
import { Text, View } from "react-native";
import Clipboard from "@react-native-clipboard/clipboard";

import { Button } from "~/components";
import { MainLayout } from "./layouts/MainLayout";

export const SCREEN_CHECK_INVITE = "CheckInviteScreen";

export function CheckInviteScreen() {
  function onSkip() {
    //navigation.navigate();
  }

  async function onCheckInvite() {
    const text = await Clipboard.getString();

    if (text.includes("https://moviepals.io/")) {
      activateInvite(text);
    }
  }

  function activateInvite(text: string) {

  }

  return (
    <MainLayout
      edges={["top", "left", "right", "bottom"]}
      canGoBack
      title="Invites"
    >
      <View className="flex-1">
        <View className="flex-1 space-y-1">
          <Text className="font-primary-bold text-neutral-1 text-2xl">
            Do you have an invite?
          </Text>
          <Text className="font-primary-regular text-neutral-2 text-base">
            If another person has invited you, we can instantly connect you
            together 🤗{"\n"}Otherwise, you can skip this step
          </Text>
        </View>

        <View className="space-y-3">
          <Button onPress={onCheckInvite}>Yes, I do</Button>
          <Button kind="outline" onPress={onSkip}>
            Nope, skip 👉
          </Button>
        </View>
      </View>
    </MainLayout>
  );
}
