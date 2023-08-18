import React from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

import { api, signOut } from "~/utils/api";
import { Section, UserAvatar } from "~/components";
import { useNavigation } from "~/hooks";
import { SCREEN_INVITE } from "./InviteScreen";
import { MainLayout } from "./layouts/MainLayout";
import { SCREEN_MY_SWIPE_LIST } from "./MySwipeListScreen";
import {SCREEN_SHARE_PREMIUM} from "./SharePremiumScreen";

export const SCREEN_ME = "MeScreen";

export function MeScreen() {
  const ctx = api.useContext();
  const user = api.user.getMyData.useQuery();

  const navigation = useNavigation();

  function onSharePremium() {
    navigation.navigate(SCREEN_SHARE_PREMIUM);
  }

  function onInvitePeople() {
    navigation.navigate(SCREEN_INVITE);
  }

  function onViewSwipes() {
    navigation.navigate(SCREEN_MY_SWIPE_LIST);
  }

  const resetSwipes = api.swipe.reset.useMutation();

  function onResetSwipes() {
    Alert.alert(
      "Reset swipes",
      "Are you sure you want to reset your swipes? This will reset your swipes and you will see movies you have already swiped on.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => {
            resetSwipes.mutate(undefined, {
              onSuccess() {
                ctx.swipe.fetchMySwipes.invalidate();

                Toast.show({
                  text1: "Your swipes have been reset!",
                  type: "success",
                });
              },
            });
          },
        },
      ],
    );
  }

  function onPurchasePremium() {}

  const deleteMyAccount = api.user.deleteMyAccount.useMutation({
    onSuccess() {
      signOut();
    },
  });

  function onSignOut() {
    signOut();
  }

  function onDeleteAccount() {
    deleteMyAccount.mutate();
  }

  return (
    <MainLayout canGoBack title="Me">
      <ScrollView
        className="-mx-8"
        contentContainerStyle={{ paddingHorizontal: 32, paddingBottom: 128 }}
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
                title="Reset Swipes"
                onPress={onResetSwipes}
                right={
                  resetSwipes.isLoading ? (
                    <View className="h-5 w-5">
                      <ActivityIndicator />
                    </View>
                  ) : (
                    <View className="w-5" />
                  )
                }
                subtitle="Start swiping from scratch"
              />

              <Section
                title="Invite People"
                onPress={onInvitePeople}
                showArrowRight
                subtitle="Invite people to pick a movie together"
              />

              <Section
                title="Share Premium"
                onPress={onSharePremium}
                showArrowRight
                subtitle="You have premium, wanna share it with other people?"
              />

              <Section
                title="Get Premium"
                onPress={onPurchasePremium}
                showArrowRight
                subtitle="Ad-free, unlimited matches, share with your friends"
              />

              <Text className="font-primary-regular text-neutral-2 text-base">
                Need help? Send a message to{" "}
                <Pressable
                  onPress={() => Linking.openURL("mailto:help@moviepals.io")}
                  className="translate-y-0.5"
                >
                  <Text className="font-primary-regular text-neutral-2 text-base underline">
                    help@moviepals.io
                  </Text>
                </Pressable>
              </Text>

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
                and{" "}
                <Pressable
                  onPress={() => Linking.openURL("https://www.justwatch.com")}
                  className="translate-y-0.5"
                >
                  <Text className="font-primary-regular text-neutral-2 text-base underline">
                    justwatch.com
                  </Text>
                </Pressable>
              </Text>

              <View className="h-3" />

              <Section
                title="Sign Out"
                showArrowRight
                onPress={onSignOut}
                subtitle="End your session"
              />

              <Section
                danger
                onPress={onDeleteAccount}
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
