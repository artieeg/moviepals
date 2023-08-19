import messaging from "@react-native-firebase/messaging";
import { useQuery } from "@tanstack/react-query";

export function useFCMPermission() {
  return useQuery(["fcm-permission"], async () => {
    return messaging().hasPermission();
  });
}
