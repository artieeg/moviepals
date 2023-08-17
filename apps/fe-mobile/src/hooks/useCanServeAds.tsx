import { AdsConsent } from "react-native-google-mobile-ads";
import { useQuery } from "@tanstack/react-query";

import { useAdmob } from "./useAdmob";

export function useCanServeAds() {
  const admob = useAdmob();

  return useQuery(
    ["can-serve-ads"],
    async () => {
      const { storeAndAccessInformationOnDevice } =
        await AdsConsent.getUserChoices();

      return storeAndAccessInformationOnDevice;
    },
    { enabled: admob.isSuccess },
  );
}
