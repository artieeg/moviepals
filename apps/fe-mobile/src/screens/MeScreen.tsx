import React, { useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Purchases, { PurchasesError } from "react-native-purchases";
import Animated from "react-native-reanimated";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useColorScheme } from "nativewind";

import { api, signOut } from "~/utils/api";
import { Section, Switch, UserAvatar } from "~/components";
import { useNavigation, usePremiumProduct } from "~/hooks";
import { SCREEN_FEEDBACK } from "./FeedbackScreen";
import { SCREEN_INVITE } from "./InviteScreen";
import { MainLayout, useMainLayoutScrollHandler } from "./layouts/MainLayout";
import { SCREEN_MY_SWIPE_LIST } from "./MySwipeListScreen";
import { SCREEN_SHARE_PREMIUM } from "./SharePremiumScreen";
import { SCREEN_THANK_YOU } from "./ThankYouScreen";
import { SCREEN_USER_SETTINGS } from "./UserSettingsScreen";

export const SCREEN_ME = "MeScreen";

export function MeScreen() {
  const ctx = api.useContext();
  const user = api.user.getMyData.useQuery();

  const { colorScheme, toggleColorScheme } = useColorScheme();

  const paidStatus = api.user.isPaid.useQuery();

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

  const premium = usePremiumProduct();

  const [isPurchasingPremium, setIsPurchasingPremium] = React.useState(false);
  const [isRestoringPurchases, setIsRestoringPurchases] = React.useState(false);

  useFocusEffect(
    useCallback(() => {
      user.refetch();
      paidStatus.refetch();
    }, []),
  );

  async function onRestorePurchases() {
    setIsRestoringPurchases(true);

    try {
      await Purchases.restorePurchases();

      setTimeout(() => {
        user.refetch();
        paidStatus.refetch();
      }, 400);

      navigation.navigate(SCREEN_THANK_YOU);
    } catch (e) {
      Alert.alert(
        "Purchases not found",
        "Is this a mistake? Contact us: hey@moviepals.io",
      );
      console.error(e);
      console.error((e as PurchasesError).underlyingErrorMessage);
    } finally {
      setIsRestoringPurchases(false);
    }
  }

  async function onPurchasePremium() {
    if (!premium.data?.product.identifier) {
      return;
    }

    setIsPurchasingPremium(true);

    try {
      await Purchases.purchaseStoreProduct(premium.data.product);

      navigation.navigate(SCREEN_THANK_YOU);
    } catch (e) {
      console.error(e);
      console.error((e as PurchasesError).underlyingErrorMessage);
    } finally {
      setTimeout(() => {
        user.refetch();
        paidStatus.refetch();

        setIsPurchasingPremium(false);
      }, 1000);
    }
  }

  const deleteMyAccount = api.user.deleteMyAccount.useMutation({
    onSuccess() {
      signOut();
    },
  });

  function onSignOut() {
    signOut();
  }

  function onDeleteAccount() {
    Alert.alert(
      "Delete account",
      "Are you sure you want to delete your account? This will delete all your data and you will not be able to recover it.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteMyAccount.mutate(),
        },
      ],
    );
  }

  async function onToggleDarkMode() {
    toggleColorScheme();

    await AsyncStorage.setItem(
      "theme",
      colorScheme === "dark" ? "light" : "dark",
    );
  }

  function onUpdateUser() {
    navigation.navigate(SCREEN_USER_SETTINGS);
  }

  function onShareFeedback() {
    navigation.navigate(SCREEN_FEEDBACK);
  }

  const { handler, tweener } = useMainLayoutScrollHandler();

  return (
    <MainLayout
      borderTweenerValue={tweener}
      edges={["top", "left", "right"]}
      canGoBack
      title="Me"
    >
      <Animated.ScrollView
        onScroll={handler}
        className="-mx-8"
        contentContainerStyle={{ paddingHorizontal: 32, paddingBottom: 128 }}
      >
        {user.isSuccess && (
          <View className="flex-1 space-y-8">
            <TouchableOpacity
              onPress={onUpdateUser}
              className="my-4 items-center justify-center"
            >
              <Text className="mb-2 font-primary-regular text-neutral-2 dark:text-neutral-5 text-sm">
                Press to edit
              </Text>

              <UserAvatar emoji={user.data.emoji} />

              <Text className="mt-2 font-primary-bold text-neutral-1 dark:text-white text-xl">
                {user.data.name}
              </Text>

              <Text className="text-neutral-2 dark:text-neutral-5 font-primary-regular text-base">
                @{user.data.username}
              </Text>
            </TouchableOpacity>

            <View className="space-y-6">
              <Section
                title="Share Feedback"
                onPress={onShareFeedback}
                showArrowRight
                subtitle="Share your feedback"
              />

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
                title="Dark Mode"
                subtitle={
                  colorScheme === "dark"
                    ? "Go back to light ☀️"
                    : "Switch to the dark side 🌙"
                }
                onPress={onToggleDarkMode}
                right={
                  <View className="ml-4">
                    <Switch
                      enabled={colorScheme === "dark"}
                      onToggle={onToggleDarkMode}
                    />
                  </View>
                }
              />

              {paidStatus.isSuccess && paidStatus.data.isPaid === "paid" && (
                <Section
                  title="Share Premium"
                  onPress={onSharePremium}
                  showArrowRight
                  subtitle="You have premium, wanna share it with other people?"
                />
              )}

              {paidStatus.isSuccess && paidStatus.data.isPaid === "shared" && (
                <Section
                  title="Premium (shared)"
                  subtitle="Someone shared their premium with you!"
                />
              )}

              {paidStatus.isSuccess && !paidStatus.data.isPaid && (
                <View className="space-y-6">
                  <Section
                    title="Restore Premium"
                    onPress={onRestorePurchases}
                    right={
                      isRestoringPurchases ? (
                        <View className="h-5 w-5">
                          <ActivityIndicator />
                        </View>
                      ) : (
                        <View className="w-5" />
                      )
                    }
                    subtitle="Restore your previous premium purchase"
                  />

                  <Section
                    title="Get Premium"
                    onPress={onPurchasePremium}
                    right={
                      isPurchasingPremium ? (
                        <View className="h-5 w-5">
                          <ActivityIndicator />
                        </View>
                      ) : (
                        <View className="w-5" />
                      )
                    }
                    subtitle="Ad-free experience, unlimited swipes, and more!"
                  />
                </View>
              )}

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

              <Text className="font-primary-regular text-neutral-2 dark:text-neutral-5 text-base">
                Need help? Email us at{" "}
                <Pressable
                  onPress={() => Linking.openURL("mailto:hey@moviepals.io")}
                  className={Platform.select({
                    ios: "translate-y-0.5",
                    default: "translate-y-[7px]",
                  })}
                >
                  <Text className="font-primary-regular text-neutral-2 dark:text-neutral-5 text-base underline">
                    hey@moviepals.io
                  </Text>
                </Pressable>
              </Text>

              <Text className="font-primary-regular text-neutral-2 dark:text-neutral-5 text-base">
                MoviePals is powered by{" "}
                <Pressable
                  onPress={() => Linking.openURL("https://www.themoviedb.org")}
                  className={Platform.select({
                    ios: "translate-y-0.5",
                    default: "translate-y-[7px]",
                  })}
                >
                  <Text className="font-primary-regular text-neutral-2 dark:text-neutral-5 text-base underline">
                    themoviedb.org
                  </Text>
                </Pressable>{" "}
                and{" "}
                <Pressable
                  onPress={() => Linking.openURL("https://www.justwatch.com")}
                  className={Platform.select({
                    ios: "translate-y-0.5",
                    default: "translate-y-[7px]",
                  })}
                >
                  <Text className="font-primary-regular text-neutral-2 dark:text-neutral-5 text-base underline">
                    justwatch.com
                  </Text>
                </Pressable>
                , and is not endorsed or certified by TMDb or JustWatch.
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
      </Animated.ScrollView>
    </MainLayout>
  );
}
