import React from "react";
import { Platform, ViewProps } from "react-native";
import {
  RewardedAd,
  RewardedAdEventType,
} from "react-native-google-mobile-ads";
import { PurchasesError } from "react-native-purchases";
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from "react-native-reanimated";
import { useQuery } from "@tanstack/react-query";
import { BrightStar } from "iconoir-react-native";

import { api } from "~/utils/api";
import { env } from "~/utils/env";
import { useCanServeAds, useNavigation, usePremiumProduct } from "~/hooks";
import { SCREEN_THANK_YOU } from "~/navigators/SwipeNavigator";
import { Prompt } from "./Prompt";

const ad = Platform.select({
  ios: env.REWARDED_AD_IOS,
  default: env.REWARDED_AD_ANDROID,
});

function useRewardedAd() {
  const user = api.user.getMyData.useQuery();

  return useQuery(["rewarded-ad", user.data?.id], async () => {
    return new Promise<RewardedAd>((resolve) => {
      const rewarded = RewardedAd.createForAdRequest(ad, {
        serverSideVerificationOptions: {
          userId: user.data?.id,
          customData: ad,
        },
      });

      const loadedUnsub = rewarded.addAdEventListener(
        RewardedAdEventType.LOADED,
        () => {
          loadedUnsub();

          resolve(rewarded);
        },
      );

      rewarded.load();

      return rewarded;
    });
  });
}

export function RanOutOfSwipes({
  onProceed,
  visible,
  ...rest
}: ViewProps & {
  onProceed(): void;
  visible: boolean;
}) {
  const opacity = useDerivedValue(() => {
    return withTiming(visible ? 1 : 0);
  }, [visible]);

  const canServeAds = useCanServeAds();

  const premium = usePremiumProduct();

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

  const rewarded = useRewardedAd();

  async function onWatchRewardedAd() {
    try {
      await rewarded.data?.show();

      onProceed();
    } finally {
      rewarded.refetch();
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
        title="Hey, slow down a little 😅"
        subtitle={
          canServeAds.data === true
            ? "You’ve ran out of swipes for the day. Watch a short ad and get +40 swipes, or buy premium for unlimited access (you can share it with up to 4 people 🙌 )"
            : "You’ve ran out of swipes for the day. Buy premium for unlimited access (you can share it with up to 4 friends 🙌 )"
        }
        buttons={[
          {
            title: `get premium for ${premium.data?.formattedPrice}`,
            onPress: onPurchasePremium,
          },
          {
            kind: "outline",
            title: `watch a rewarded ad`,
            onPress: onWatchRewardedAd,
          },
        ]}
      />
    </Animated.View>
  );
}
