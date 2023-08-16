import React, { useState } from "react";
import { Alert, Platform, Text, View } from "react-native";
import Animated from "react-native-reanimated";
import Toast from "react-native-toast-message";
import Clipboard from "@react-native-clipboard/clipboard";

import { api } from "~/utils/api";
import { Button } from "~/components";
import { useNavigation } from "~/hooks";
import { NAVIGATOR_MAIN } from "~/navigators/RootNavigator";
import { MainLayout } from "./layouts/MainLayout";
import { User } from ".prisma/client";

export const SCREEN_CHECK_INVITE = "CheckInviteScreen";

export function CheckInviteScreen() {
  const applyInvite = api.invite.applyInvite.useMutation({
    onSuccess({ inviter }) {
      Toast.show({
        type: "success",
        text1: `Accepted an invite from ${inviter.name}!`,
      });
    },
  });

  const navigation = useNavigation();

  function onSkip() {
    navigation.navigate(NAVIGATOR_MAIN);
  }

  async function onCheckInvite() {
    activateInvite();
  }

  async function activateInvite() {
    const text = await Clipboard.getString();

    if (!text.includes("https://moviepals.io")) {
      return;
    }

    const inviteUrl = text.split(" ").find((s) => s.includes("https://"));

    if (!inviteUrl) return;

    applyInvite.mutate({ inviteUrl });
  }

  return (
    <MainLayout
      edges={["top", "left", "right", "bottom"]}
      canGoBack
      title="Invites"
    >
      <View className="flex-1">
        <Animated.View className="flex-1 space-y-1">
          <Text className="font-primary-bold text-neutral-1 text-2xl">
            Do you have an invite?
          </Text>
          <Text className="font-primary-regular text-neutral-2 text-base">
            If you don't have an invite, you can skip this step. If another
            person has invited you via link, we can instantly connect you
            together 🤗
          </Text>
        </Animated.View>

        <View className="space-y-3">
          <Button onPress={onCheckInvite}>Yes, I do</Button>
          <Button kind="outline" onPress={onSkip}>
            I don't have one, skip 👉
          </Button>
        </View>
      </View>
    </MainLayout>
  );
}
