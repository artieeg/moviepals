import { Platform } from "react-native";
import {
  RewardedAd,
  RewardedAdEventType,
} from "react-native-google-mobile-ads";
import { useQuery } from "@tanstack/react-query";

import { api } from "~/utils/api";
import { env } from "~/utils/env";

const ad = Platform.select({
  ios: env.REWARDED_AD_IOS,
  default: env.REWARDED_AD_ANDROID,
});

export function useRewardedAd() {
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
