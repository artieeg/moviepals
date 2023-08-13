import React from "react";
import { Platform, Text, View, ViewProps } from "react-native";
import {
  RewardedAd,
  RewardedAdEventType,
} from "react-native-google-mobile-ads";
import Purchases from "react-native-purchases";
import { useQuery } from "@tanstack/react-query";
import { BrightStar } from "iconoir-react-native";

import { api } from "~/utils/api";
import { env } from "~/utils/env";
import { useCanServeAds, usePremiumProduct } from "~/hooks";
import { Button } from "./Button";

const ad = Platform.select({
  ios: env.REWARDED_AD_IOS,
  default: env.REWARDED_AD_ANDROID,
});

function useRewardedAd() {
  const user = api.user.getUserData.useQuery();

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

export function RanOutOfSwipes(props: ViewProps) {
  const canServeAds = useCanServeAds();

  const premium = usePremiumProduct();

  async function onPurchasePremium() {
    if (!premium.data?.product.identifier) {
      return;
    }

    try {
      await Purchases.purchaseStoreProduct(premium.data.product);
    } finally {
    }
  }

  const rewarded = useRewardedAd();

  async function onWatchRewardedAd() {
    try {
      await rewarded.data?.show();
    } finally {
      rewarded.refetch();
    }
  }

  return (
    <View className="flex-1" {...props}>
      <View className="items-center justify-center space-y-4">
        <View className="bg-brand-1-10 h-20 w-20 items-center justify-center rounded-2xl">
          <BrightStar color="#6867AA" fill="#6867AA" width={32} height={32} />
        </View>

        <View className="items-center justify-center space-y-2">
          <Text className="font-primary-bold text-xl">
            Hey, slow down a little 😅
          </Text>
          <Text className="font-primary-regular text-neutral-2 text-center text-base">
            {canServeAds.data === true ? (
              <>
                You’ve ran out of swipes for the day. Watch a short ad and get
                +40 swipes, or buy premium for unlimited access (you can share
                it with up to 4 people 🙌 )
              </>
            ) : (
              <>
                You’ve ran out of swipes for the day. Buy premium for unlimited
                access (you can share it with up to 4 friends 🙌 )
              </>
            )}
          </Text>
        </View>
      </View>
      <View className="flex-1 justify-end space-y-3">
        <Button onPress={onPurchasePremium}>
          get premium for {premium.data?.formattedPrice}
        </Button>

        <Button kind="outline" onPress={onWatchRewardedAd}>
          watch a rewarded ad
        </Button>
      </View>
    </View>
  );
}
