import { PermissionsAndroid, Platform } from "react-native";
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
      if (Platform.OS === "android") {
        const r = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );

        if (r === PermissionsAndroid.RESULTS.GRANTED) {
          return "granted";
        }
      } else {
        const r = await messaging().requestPermission();

        if (r === messaging.AuthorizationStatus.AUTHORIZED) {
          return "granted";
        }
      }

      return "denied";
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
        if (Platform.OS === "android") {
          const r = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          );

          if (r === PermissionsAndroid.RESULTS.GRANTED) {
            return "granted";
          }
        } else {
          const r = await messaging().requestPermission();
          if (r === messaging.AuthorizationStatus.AUTHORIZED) {
            return "granted";
          }
        }
      } else {
        if (permission === messaging.AuthorizationStatus.AUTHORIZED) {
          return "granted";
        }
      }
      return "denied";
    },
    {
      onSuccess(permission) {
        if (permission === "granted") {
          AsyncStorage.setItem(permissionRequestedKey, "true");

          qc.refetchQueries(KEY_FCM_TOKEN);
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
