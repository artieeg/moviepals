import { AdsConsent } from "react-native-google-mobile-ads";
import { useQuery } from "@tanstack/react-query";

import { useAdmob, useAdsConsentQuery } from "./useAdmob";

export function useCanServeAds() {
  const admob = useAdmob();

  const consent = useAdsConsentQuery();

  return useQuery(["can-serve-ads", admob.isSuccess, consent.data], async () => {
    const { storeAndAccessInformationOnDevice } =
      await AdsConsent.getUserChoices();

    return storeAndAccessInformationOnDevice;
  });
}
