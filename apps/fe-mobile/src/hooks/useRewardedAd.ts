import { Platform } from "react-native";
import {
  RewardedAd,
  RewardedAdEventType,
} from "react-native-google-mobile-ads";
import { useQuery } from "@tanstack/react-query";

import { api } from "~/utils/api";
import { env } from "~/utils/env";
import { useAdsConsentQuery } from "./useAdmob";

const ad = Platform.select({
  ios: env.REWARDED_AD_IOS,
  default: env.REWARDED_AD_ANDROID,
});

export function useRewardedAd() {
  const consent = useAdsConsentQuery();

  const user = api.user.getMyData.useQuery();
  const adCallback = api.ad_impression.adImpression.useMutation();

  return useQuery(["rewarded-ad", user.data?.id, consent.data], async () => {
    console.log("consent", consent.data)


    return new Promise<RewardedAd>((resolve) => {
      const rewarded = RewardedAd.createForAdRequest(ad, {
        serverSideVerificationOptions: {
          userId: user.data?.id,
          customData: ad,
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
          console.log("loaded");
          loadedUnsub();

          resolve(rewarded);
        },
      );

      rewarded.load();

      return rewarded;
    });
  });
}
