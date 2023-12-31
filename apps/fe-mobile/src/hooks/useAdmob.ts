import mobileAds, {
  AdsConsent,
  AdsConsentStatus,
} from "react-native-google-mobile-ads";
import { check, PERMISSIONS, request, RESULTS } from "react-native-permissions";
import { useQuery } from "@tanstack/react-query";
import {Alert} from "react-native";

export function useAdmob() {
  const trackingPermission = useAppTrackingPermissionQuery({ enabled: false });
  const consent = useAdsConsentQuery();

  return useAdMobInit({
    enabled: consent.isSuccess && trackingPermission.isSuccess,
  });
}

function useAdMobInit({ enabled }: { enabled: boolean }) {
  return useQuery(
    ["admob-init"],
    async () => {
      Alert.alert("enabling ads");
      return mobileAds().initialize();
    },
    { enabled },
  );
}

export function useAdsConsentQuery() {
  return useQuery(["ads-consent"], async () => {
    const consentInfo = await AdsConsent.requestInfoUpdate();

    if (
      consentInfo.isConsentFormAvailable &&
      consentInfo.status === AdsConsentStatus.REQUIRED
    ) {
      const { status } = await AdsConsent.showForm();

      return status;
    }

    return consentInfo.status;
  }, {enabled: false});
}

function useAppTrackingPermissionQuery(
  { enabled }: { enabled: boolean } = { enabled: false },
) {
  return useQuery(
    ["app-tracking-permission"],
    async () => {
      const result = await check(PERMISSIONS.IOS.APP_TRACKING_TRANSPARENCY);

      if (result === RESULTS.DENIED) {
        await request(PERMISSIONS.IOS.APP_TRACKING_TRANSPARENCY);
      }

      return result;
    },
    { enabled },
  );
}
