import React, { useState } from "react";
import { Text, View } from "react-native";

import { InviteOptions } from "~/components";
import { MainLayout } from "./layouts/MainLayout";

export const SCREEN_INVITE = "InviteScreen";

export function InviteScreen() {
  const [linkCopied, setLinkCopied] = useState(false);

  function onLinkCopied() {
    setLinkCopied(true);
  }

  return (
    <MainLayout canGoBack title="Send Invites">
      <View className="space-y-3">
        <Text className="font-primary-bold text-neutral-1 dark:text-white text-2xl">
          Invite friends, Swipe Together 🍿
        </Text>
        <Text className="font-primary-regular text-neutral-2 dark:text-neutral-5 text-base">
          Invite your friends to MoviePals and swipe together!
        </Text>
        <Text className="font-primary-regular text-neutral-2 dark:text-neutral-5 text-base">
          If at least 3 people accept your invite,
          <Text className="font-primary-bold text-neutral-2 dark:text-neutral-5 text-base">
            {" "}
            all of you{" "}
          </Text>
          will get premium access for free!
        </Text>
      </View>

      <View className="flex-1 mt-12">
        <InviteOptions onLinkCopied={onLinkCopied} linkCopied={linkCopied} />
      </View>
    </MainLayout>
  );
}
