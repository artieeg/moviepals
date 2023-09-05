import AsyncStorage from "@react-native-async-storage/async-storage";
import messaging from "@react-native-firebase/messaging";
import { useMutation, useQuery } from "@tanstack/react-query";

import { api } from "~/utils/api";

const permissionRequestedKey = "fcm-permission-requested";

export function useFCMPermissionRequestMutation({
  onSuccess,
}: {
  onSuccess: (result: string) => void;
}) {
  return useMutation(
    async () => {
      return messaging().requestPermission();
    },
    { onSuccess: onSuccess as any },
  );
}

export function useFCMPermission() {
  return useQuery(["fcm-permission"], async () => {
    return messaging().hasPermission();
  });
}

/**
 * For the cases, if user has skipped this step during onboarding
 * */
export function useFCMPermissionBackupQuery() {
  return useQuery(["fcm-permission-backup"], async () => {});
}

export function useFCMToken() {
  const setFCMToken = api.user.setFCMToken.useMutation();

  useQuery(
    ["fcm-token"],
    async () => {
      const token = await messaging().getToken();

      return token;
    },
    {
      onSuccess(fcmToken) {
        setFCMToken.mutate({ fcmToken });
      },
    },
  );
}
