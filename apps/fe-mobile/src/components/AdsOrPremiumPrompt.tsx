import React from "react";
import { Platform, ViewProps } from "react-native";
import { AdEventType, AdsConsent, AdsConsentStatus } from "react-native-google-mobile-ads";
import { PERMISSIONS, request } from "react-native-permissions";
import { PurchasesError } from "react-native-purchases";
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from "react-native-reanimated";
import Toast from "react-native-toast-message";
import { BrightStar } from "iconoir-react-native";

import {
  useCanServeAds,
  useNavigation,
  usePremiumProduct,
  useRewardedAd,
} from "~/hooks";
import { SCREEN_THANK_YOU } from "~/navigators/SwipeNavigator";
import { Prompt } from "./Prompt";

export function AdsOrPremiumPrompt({
  onProceed,
  onSkip,
  visible,
  mode,
  ...rest
}: ViewProps & {
  onProceed(): void;
  onSkip?(): void;
  visible: boolean;
  mode: "ad" | "ad-permission";
}) {
  const opacity = useDerivedValue(() => {
    return withTiming(visible ? 1 : 0);
  }, [visible]);

  const premium = usePremiumProduct();
  const ad = useRewardedAd();
  const canServeAds = useCanServeAds();

  const navigation = useNavigation();

  async function onPurchasePremium() {
    if (!premium.data?.product.identifier) {
      return;
    }

    try {
      onProceed();

      navigation.navigate(SCREEN_THANK_YOU);
    } catch (e) {
      console.error((e as PurchasesError).underlyingErrorMessage);
    } finally {
    }
  }

  async function onUpdateGDPRConsent() {
    const consentInfo = await AdsConsent.requestInfoUpdate();

    if (
      consentInfo.status === AdsConsentStatus.REQUIRED ||
      canServeAds.data === false
    ) {
      await AdsConsent.showForm();
    }

    const choices = await AdsConsent.getUserChoices();

    if (choices.storeAndAccessInformationOnDevice) {
      if (Platform.OS === "ios") {
        await request(PERMISSIONS.IOS.APP_TRACKING_TRANSPARENCY);
      }
    }

    canServeAds.refetch();
  }

  async function onAllowAds() {
    const consentInfo = await AdsConsent.requestInfoUpdate();

    if (
      consentInfo.status === AdsConsentStatus.REQUIRED ||
      canServeAds.data === false
    ) {
      await AdsConsent.showForm();
    }

    const choices = await AdsConsent.getUserChoices();

    if (choices.storeAndAccessInformationOnDevice) {
      if (Platform.OS === "ios") {
        await request(PERMISSIONS.IOS.APP_TRACKING_TRANSPARENCY);
      }
    }

    canServeAds.refetch();

    onSkip?.();
  }

  async function onWatchRewardedAd() {
    let data = ad.data;

    if (!data) {
      const refetchResult = await ad.refetch();
      console.log(refetchResult)

      if (refetchResult.data) {
        data = refetchResult.data;
      } else {
        Toast.show({
          type: "error",
          text1:
            "Oops, something went wrong when fetching the ad, please try again later",
        });
      }
    }

    try {
      if (data) {
        await data.show();

        data.addAdEventListener(AdEventType.CLOSED, () => {
          onProceed();
        })
      }
    } finally {
      ad.refetch();
    }
  }

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      pointerEvents={visible ? "auto" : "none"}
      style={style}
      className="flex-1"
      {...rest}
    >
      <Prompt
        icon={<BrightStar />}
        title={
          mode === "ad" ? "Hey, slow down a little 😅" : "Hey, a short stop 🍿"
        }
        subtitle={
          mode === "ad"
            ? canServeAds.data === true
              ? "Swipe-oops, you've hit the daily limit! 🙅. Wait until tomorrow, or watch a short ad and get +40 swipes. You can also buy premium for unlimited access (you can share it with up to 4 people 🙌)"
              : "Swipe-oops, you've hit the daily limit! 🙅. Wait until tomorrow, or buy premium for unlimited access (you can share it with up to 4 people 🙌).\n\nYou can also watch a short ad to get +40 swipes, but you need to configure your GDPR consent"
            : "MoviePals depends on occassional ads. They are like the popcorn to our movie marathon  – helps us keep the reels spinning.\n\nWe need your permission for a better ad experience. You can always do that later from the settings!\n\nYou can also get premium for unlimited ad-free experience. You can share it with up to 4 people 🙌"
        }
        buttons={[
          {
            title: `get premium for ${premium.data?.formattedPrice}`,
            onPress: onPurchasePremium,
          },
          mode === "ad"
            ? canServeAds.data
              ? {
                  kind: "outline",
                  title: `watch a rewarded ad`,
                  onPress: onWatchRewardedAd,
                }
              : {
                  kind: "outline",
                  title: `Update GDPR Consent`,
                  onPress: onUpdateGDPRConsent,
                }
            : {
                kind: "outline",
                title: "allow ads",
                onPress: onAllowAds,
              },

          mode === "ad-permission"
            ? {
                kind: "text",
                title: "skip",
                onPress: onSkip,
              }
            : undefined,
        ]}
      />
    </Animated.View>
  );
}
