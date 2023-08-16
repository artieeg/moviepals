import React from "react";
import { Platform, ViewProps } from "react-native";
import { AdsConsent } from "react-native-google-mobile-ads";
import { PurchasesError } from "react-native-purchases";
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from "react-native-reanimated";
import { BrightStar } from "iconoir-react-native";

import {
  useCanServeAds,
  useNavigation,
  usePremiumProduct,
  useRewardedAd,
} from "~/hooks";
import { SCREEN_THANK_YOU } from "~/navigators/SwipeNavigator";
import { Prompt } from "./Prompt";

export function RanOutOfSwipes({
  onProceed,
  visible,
  mode,
  ...rest
}: ViewProps & {
  onProceed(): void;
  mode: "ad" | "ad-permission";
  visible: boolean;
}) {
  const opacity = useDerivedValue(() => {
    return withTiming(visible ? 1 : 0);
  }, [visible]);

  const canServeAds = useCanServeAds();

  const premium = usePremiumProduct();
  const ad = useRewardedAd();

  const navigation = useNavigation();

  async function onPurchasePremium() {
    if (!premium.data?.product.identifier) {
      return;
    }

    try {
      //await Purchases.purchaseStoreProduct(premium.data.product);
      onProceed();

      navigation.navigate(SCREEN_THANK_YOU);
    } catch (e) {
      console.log(JSON.stringify(e, null, 2));
      console.error((e as PurchasesError).underlyingErrorMessage);
      console.error((e as PurchasesError).underlyingErrorMessage);
    } finally {
    }
  }

  async function onAllowAds() {
    const consentInfo = await AdsConsent.requestInfoUpdate({

    });
    console.log(consentInfo)
  }

  async function onWatchRewardedAd() {
    try {
      await ad.data?.show();

      onProceed();
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
              ? "Swipe-oops, you've hit the daily limit! 🙅. Watch a short ad and get +40 swipes, or buy premium for unlimited access (you can share it with up to 4 people 🙌)"
              : "You’ve ran out of swipes for the day. Buy premium for unlimited access (you can share it with up to 4 friends 🙌)"
            : "MoviePals depends on occassional ads. They are like the popcorn to our movie marathon  – helps us keep the reels spinning.\n\nWe need your permission for a better ad experience.\n\nYou can also get premium for unlimited ad-free experience. You can share premium  with up to 4 people 🙌"
        }
        buttons={[
          {
            title: `get premium for ${premium.data?.formattedPrice}`,
            onPress: onPurchasePremium,
          },
          mode === "ad"
            ? {
                kind: "outline",
                title: `watch a rewarded ad`,
                onPress: onWatchRewardedAd,
              }
            : {
                kind: "outline",
                title: "allow ads",
                onPress: onAllowAds,
              },
        ]}
      />
    </Animated.View>
  );
}
