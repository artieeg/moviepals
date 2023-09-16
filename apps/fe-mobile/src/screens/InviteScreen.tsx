import React, { useState } from "react";
import { Text, View } from "react-native";

import { InviteOptions } from "~/components";
import { MainLayout } from "./layouts/MainLayout";

export const SCREEN_INVITE = "InviteScreen";

export function InviteScreen() {
  const [linkCopied, setLinkCopied] = useState(false);

  return (
    <MainLayout canGoBack title="Invites">
      <View className="space-y-3">
        <Text className="font-primary-bold text-neutral-1 dark:text-white text-2xl">
          Invite & Swipe Together
        </Text>
        <Text className="font-primary-regular text-neutral-2 dark:text-neutral-5 text-base">
          Would you like to invite people to find movies you all would like to
          watch?
        </Text>

        <Text className="font-primary-regular text-neutral-2 dark:text-neutral-5 text-base">
          If at least 2 people accept your invite,
          <Text className="font-primary-bold text-neutral-2 dark:text-neutral-5 text-base">
            {" "}
            all of you{" "}
          </Text>
          will get premium access for free!
        </Text>
      </View>

      <View className="mt-8">
        <InviteOptions
          linkCopied={linkCopied}
          onLinkCopied={() => setLinkCopied(true)}
        />
      </View>
    </MainLayout>
  );
}
