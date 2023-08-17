import React from "react";
import { Linking, Pressable, ScrollView, Text, View } from "react-native";

import { api } from "~/utils/api";
import { Section, UserAvatar } from "~/components";
import { useNavigation } from "~/hooks";
import { SCREEN_INVITE } from "./InviteScreen";
import { MainLayout } from "./layouts/MainLayout";
import { SCREEN_MY_SWIPE_LIST } from "./MySwipeListScreen";

export const SCREEN_ME = "MeScreen";

export function MeScreen() {
  const user = api.user.getMyData.useQuery();

  const navigation = useNavigation();

  function onInvitePeople() {
    navigation.navigate(SCREEN_INVITE);
  }

  function onViewSwipes() {
    navigation.navigate(SCREEN_MY_SWIPE_LIST);
  }

  function onPurchasePremium() {}

  return (
    <MainLayout canGoBack title="Me">
      <ScrollView
        className="-mx-8"
        contentContainerStyle={{ paddingHorizontal: 32 }}
      >
        {user.isSuccess && (
          <View className="flex-1 space-y-8">
            <View className="my-4 items-center justify-center">
              <UserAvatar emoji={user.data.emoji} />

              <Text className="font-primary-bold text-neutral-1 text-xl">
                {user.data.name}
              </Text>

              <Text className="text-neutral-2 font-primary-regular text-base">
                @{user.data.username}
              </Text>
            </View>

            <View className="space-y-6">
              <Section
                title="My Swipes"
                onPress={onViewSwipes}
                showArrowRight
                subtitle="View your swipes"
              />

              <Section
                title="Invite People"
                onPress={onInvitePeople}
                showArrowRight
                subtitle="Invite people to pick a movie together"
              />

              <Section
                title="Get Premium"
                onPress={onPurchasePremium}
                showArrowRight
                subtitle="Ad-free, unlimited matches, share with your friends"
              />

              <Text className="font-primary-regular text-neutral-2 text-base">
                MoviePals is powered by{" "}
                <Pressable
                  onPress={() => Linking.openURL("https://www.themoviedb.org")}
                  className="translate-y-0.5"
                >
                  <Text className="font-primary-regular text-neutral-2 text-base underline">
                    themoviedb.org
                  </Text>
                </Pressable>{" "}
                for movies, cast, directors, etc. and{" "}
                <Pressable
                  onPress={() => Linking.openURL("https://www.justwatch.com")}
                  className="translate-y-0.5"
                >
                  <Text className="font-primary-regular text-neutral-2 text-base underline">
                    justwatch.com
                  </Text>
                </Pressable>{" "}
                for streaming service availability.
              </Text>

              <View className="h-3" />
              <Section
                title="Sign Out"
                showArrowRight
                subtitle="End your session"
              />

              <Section
                danger
                title="Delete Account"
                showArrowRight
                subtitle="Erase your data from our servers"
              />
            </View>
          </View>
        )}
      </ScrollView>
    </MainLayout>
  );
}
