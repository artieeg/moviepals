import messaging from "@react-native-firebase/messaging";
import { useMutation } from "@tanstack/react-query";

export function useFCMPermissionRequest({
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
