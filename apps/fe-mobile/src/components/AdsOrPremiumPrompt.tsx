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
import {sendEvent} from "~/utils/plausible";

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

  const [isPurchasingPremium, setIsPurchasingPremium] = useState(false);
  async function onPurchasePremium() {
    if (!premium.data?.product.identifier) {
      return;
    }

    setIsPurchasingPremium(true);
    try {
      await Purchases.purchaseStoreProduct(premium.data.product);

      onProceed();

      navigation.navigate(SCREEN_THANK_YOU);
    } catch (e) {
      console.error(e);
      console.error((e as PurchasesError).underlyingErrorMessage);
    } finally {
      setIsPurchasingPremium(false);
    }
  }

  async function onUpdateGDPRConsent() {
    sendEvent("allow_ads")
    const consentInfo = await AdsConsent.requestInfoUpdate();

    if (
      consentInfo.status === AdsConsentStatus.REQUIRED ||
      canServeAds.data === false
    ) {
      await AdsConsent.showForm();
    }

    const choices = await AdsConsent.getUserChoices();

    if (choices.storeAndAccessInformationOnDevice) {
    }

    if (Platform.OS === "ios") {
      await request(PERMISSIONS.IOS.APP_TRACKING_TRANSPARENCY);
    }

    adsConsent.refetch();

    canServeAds.refetch();
    ad.refetch();
    setTimeout(() => {
      onWatchRewardedAd();
    }, 400);
  }

  const [isRestoringPurchases, setIsRestoringPurchases] = useState(false);

  async function onRestorePurchases() {
    setIsRestoringPurchases(true);

    try {
      const r = await Purchases.restorePurchases();

      if (!r.entitlements.active.go_pro) {
        return;
      }

      setTimeout(() => {
        onProceed();
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
    }

    if (Platform.OS === "ios") {
      await request(PERMISSIONS.IOS.APP_TRACKING_TRANSPARENCY);
    }

    adsConsent.refetch();
    canServeAds.refetch();

    onSkip?.();
  }

  const user = api.user.getMyData.useQuery();
  const adCallback = api.ad_impression.adImpression.useMutation();

  const [loading, setLoading] = useState(false);

  async function onWatchRewardedAd() {
    sendEvent("watch_ad")

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

        onProceed();

        adCallback.mutate();
      },
    );

    const loadedUnsub = rewarded.addAdEventListener(
      RewardedAdEventType.LOADED,
      () => {
        rewarded.show();

        setLoading(false);

        loadedUnsub();
      },
    );

    rewarded.load();
    rewarded.addAdEventListener(AdEventType.ERROR, (e) => {
      if (e.message.includes("no-fill")) {
        Alert.alert(
          "No ads available right now",
          "We're so sorry, please try again later",
        );
      }

      setLoading(false);
    });
  }

  const config = api.movie_feed.getMovieFeedConfig.useQuery();

  if (!config.isSuccess) return null;

  return (
    <Prompt
      icon={<BrightStar />}
      shouldFillIcon
      title={
        mode === "ad" ? "Hey, slow down a little 😅" : "Hey, a short stop 🍿"
      }
      subtitle={
        mode === "ad"
          ? config.data.text
          : "MoviePals depends on occassional ads. They are like the popcorn to our movie marathon  – helps us keep the reels spinning.\n\nWe need your permission for a better ad experience. You can always do that later from the settings!\n\nYou can also get premium for an unlimited ad-free experience and share it with up to 4 people 🙌"
      }
      buttons={[
        {
          kind: "text",
          title: "Restore Purchases",
          isLoading: isRestoringPurchases,
          onPress: onRestorePurchases,
        },
        {
          isLoading: isPurchasingPremium,
          title: premium.isSuccess
            ? `Get Premium for ${premium.data.formattedPrice}`
            : "Get Premium",
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
                title: `Allow ads`,
                onPress: onUpdateGDPRConsent,
              }
          : {
              kind: "outline",
              title: "Allow Ads",
              onPress: onAllowAds,
            },
      ]}
    />
  );
}
