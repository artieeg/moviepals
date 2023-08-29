import React, { useState } from "react";
import { Alert, Platform, ViewProps } from "react-native";
import {
  AdEventType,
  AdsConsent,
  AdsConsentStatus,
  RewardedAd,
  RewardedAdEventType,
} from "react-native-google-mobile-ads";
import { PERMISSIONS, request } from "react-native-permissions";
import Purchases, { PurchasesError } from "react-native-purchases";
import Toast from "react-native-toast-message";
import { BrightStar } from "iconoir-react-native";

import { api } from "~/utils/api";
import { env } from "~/utils/env";
import {
  useAdsConsentQuery,
  useCanServeAds,
  useNavigation,
  usePremiumProduct,
  useRewardedAd,
} from "~/hooks";
import { SCREEN_THANK_YOU } from "~/screens";
import { Prompt } from "./Prompt";

export function AdsOrPremiumPrompt({
  onProceed,
  onSkip,
  mode,
  ...rest
}: ViewProps & {
  onProceed(): void;
  onSkip?(): void;
  mode: "ad" | "ad-permission";
}) {
  const adsConsent = useAdsConsentQuery();
  const premium = usePremiumProduct();
  const ad = useRewardedAd();
  const canServeAds = useCanServeAds();

  const navigation = useNavigation();

  async function onPurchasePremium() {
    if (!premium.data?.product.identifier) {
      return;
    }

    try {
      await Purchases.purchaseStoreProduct(premium.data.product);

      onProceed();

      navigation.navigate(SCREEN_THANK_YOU);
    } catch (e) {
      console.error(e);
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

    adsConsent.refetch();

    canServeAds.refetch();
    ad.refetch();
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

    adsConsent.refetch();
    canServeAds.refetch();

    onSkip?.();
  }

  const user = api.user.getMyData.useQuery();
  const adCallback = api.ad_impression.adImpression.useMutation();

  const [loading, setLoading] = useState(false);

  async function onWatchRewardedAd() {
    setLoading(true);

    const ad = Platform.select({
      ios: env.REWARDED_AD_IOS,
      default: env.REWARDED_AD_ANDROID,
    });

    const rewarded = RewardedAd.createForAdRequest(ad, {
      serverSideVerificationOptions: {
        userId: user.data?.id,
      },
    });

    const watchedUnsub = rewarded.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      () => {
        watchedUnsub();

        adCallback.mutate();
      },
    );

    const loadedUnsub = rewarded.addAdEventListener(
      RewardedAdEventType.LOADED,
      () => {
        rewarded.show();

        setLoading(false);
        onProceed();

        loadedUnsub();
      },
    );

    rewarded.load();
    rewarded.addAdEventListener(AdEventType.ERROR, (e) => {
      if (e.message.includes("no-fill")) {
        Alert.alert("No ads available right now", "We're so sorry, please try again later");
      }

      setLoading(false);
    });

    /*
    let data = ad.data;

    console.log({ data });

    if (!data) {
      const refetchResult = await ad.refetch();

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
        });
      }
    } finally {
      ad.refetch();
    }
     * */
  }

  return (
    <Prompt
      icon={<BrightStar />}
      shouldFillIcon
      title={
        mode === "ad" ? "Hey, slow down a little 😅" : "Hey, a short stop 🍿"
      }
      subtitle={
        mode === "ad"
          ? canServeAds.data === true
            ? "Swipe-oops, you've hit the daily limit! 🙅 Wait until tomorrow, or watch a short ad and get +40 swipes. You can also buy premium for unlimited access (... and share it with up to 4 people 🙌)"
            : "Swipe-oops, you've hit the daily limit! 🙅 Wait until tomorrow, or buy premium for an unlimited access (you can share it with up to 4 people 🙌).\n\nYou can also watch a short ad to get +40 swipes, but you need to configure your GDPR consent"
          : "MoviePals depends on occassional ads. They are like the popcorn to our movie marathon  – helps us keep the reels spinning.\n\nWe need your permission for a better ad experience. You can always do that later from the settings!\n\nYou can also get premium for an unlimited ad-free experience and share it with up to 4 people 🙌"
      }
      buttons={[
        {
          title: `Get Premium for ${premium.data?.formattedPrice}`,
          onPress: onPurchasePremium,
        },
        mode === "ad"
          ? canServeAds.data
            ? {
                kind: "outline",
                isLoading: loading,
                title: `Watch a rewarded ad`,
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
  );
}
