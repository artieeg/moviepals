import AsyncStorage from "@react-native-async-storage/async-storage";
import messaging from "@react-native-firebase/messaging";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "~/utils/api";

export const permissionRequestedKey = "fcm-permission-requested";

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

const KEY_FCM_TOKEN = ["fcm-token"];
const KEY_FCM_PERMISSION = ["fcm-permission"];

export function useFCMPermission() {
  return useQuery(KEY_FCM_PERMISSION, async () => {
    return messaging().hasPermission();
  });
}

/**
 * For the cases, if user has skipped this step during onboarding,
 * we'll try to request permission separately
 * */
export function useFCMPermissionBackupQuery() {
  const qc = useQueryClient();

  return useQuery(
    ["fcm-permission-backup"],
    async () => {
      const permission = await messaging().hasPermission();
      const permissionRequested = await AsyncStorage.getItem(
        permissionRequestedKey,
      );

      if (
        !permissionRequested //&&
        //permission === messaging.AuthorizationStatus.NOT_DETERMINED
      ) {
        return messaging().requestPermission();
      } else {
        return permission;
      }
    },
    {
      onSuccess(permission) {
        if (permission === messaging.AuthorizationStatus.AUTHORIZED) {
          AsyncStorage.setItem(permissionRequestedKey, "true");

          qc.invalidateQueries(KEY_FCM_TOKEN);
        }
      },
    },
  );
}

/**
 * Mark FCM permission as requested previously
 * */
export function useFCMPermissionRequestedMutation() {
  return useMutation(async () =>
    AsyncStorage.setItem(permissionRequestedKey, "true"),
  );
}

export function useFCMToken() {
  const setFCMToken = api.user.setFCMToken.useMutation();

  useQuery(
    KEY_FCM_TOKEN,
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
