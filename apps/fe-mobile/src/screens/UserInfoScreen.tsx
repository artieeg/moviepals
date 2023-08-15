import React from "react";
import { Text, View } from "react-native";
import { useRoute } from "@react-navigation/native";

import { api } from "~/utils/api";
import { Section, TouchableScale } from "~/components";
import { useNavigation } from "~/hooks";
import { SCREEN_MATCHES_LIST } from "~/navigators/FriendsNavigator";
import { MainLayout } from "./layouts/MainLayout";

export function UserInfoScreen() {
  const params = useRoute().params as any;
  const userId = params?.userId;

  const user = api.user.getUserData.useQuery({ userId });

  const navigation = useNavigation();

  return (
    <MainLayout
      canGoBack
      title={user.isSuccess ? user.data.user.username : "Loading..."}
    >
      {user.isSuccess && (
        <View className="flex-1 space-y-8">
          <View className="my-4 items-center justify-center">
            <UserAvatar emoji={user.data.user.emoji} />

            <Text className="font-primary-bold text-neutral-1 text-xl">
              {user.data.user.name}
            </Text>

            <Text className="text-neutral-2 font-primary-regular text-base">
              @{user.data.user.username}
            </Text>
          </View>
          <Section
            title={
              user.data.matchesCount > 0
                ? `Matches (${user.data.matchesCount})`
                : "No matches"
            }
            onPress={() => {
              if (user.data.matchesCount > 0) {
                navigation.navigate(SCREEN_MATCHES_LIST, { userId });
              }
            }}
            showArrowRight={user.data.matchesCount > 0}
            subtitle={
              user.data.matchesCount > 0
                ? "view your matches"
                : "No matches yet, keep swiping!"
            }
          />
        </View>
      )}
    </MainLayout>
  );
}

function UserAvatar({ emoji }: { onChange?: () => void; emoji: string }) {
  return (
    <TouchableScale className="bg-neutral-2-10 h-16 w-16 items-center justify-center rounded-full">
      <Text className="text-3xl">{emoji}</Text>
    </TouchableScale>
  );
}
