import messaging from "@react-native-firebase/messaging";
import { useQuery } from "@tanstack/react-query";

import { api } from "~/utils/api";

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
