import { KeyboardAvoidingView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import messaging from "@react-native-firebase/messaging";

import { api } from "~/utils/api";
import { Button } from "~/components";
import {
  useFCMPermission,
  useFCMPermissionRequestedMutation,
  useFCMPermissionRequestMutation,
  useNavigation,
  useRouteParams,
} from "~/hooks";
import { NAVIGATOR_MAIN } from "~/navigators/RootNavigator";

export const SCREEN_NOTIFICATION_PERMISSION =
  "NotificationPermissionRequestScreen";

export function NotificationPermissionRequestScreen() {
  const navigation = useNavigation();

  const { joinedMailingList } = useRouteParams<{
    joinedMailingList: boolean;
  }>();

  const markFCMPermisisonRequested = useFCMPermissionRequestedMutation();

  const permission = useFCMPermission();
  const requestPermission = useFCMPermissionRequestMutation({
    onSuccess(state: any) {
      if (state === messaging.AuthorizationStatus.AUTHORIZED) {
        allowPushNotifications.mutate({ allowPushNotifications: true });
      }
    },
  });

  const allowPushNotifications = api.user.togglePushNotifications.useMutation({
    onMutate() {
      navigation.navigate(NAVIGATOR_MAIN);
    },
  });

  function onAllow() {
    markFCMPermisisonRequested.mutate();

    if (permission.data !== messaging.AuthorizationStatus.AUTHORIZED) {
      requestPermission.mutate();
    } else {
      allowPushNotifications.mutate({ allowPushNotifications: true });
    }
  }

  function onSkip() {
    markFCMPermisisonRequested.mutate();

    allowPushNotifications.mutate({ allowPushNotifications: false });

    navigation.navigate(NAVIGATOR_MAIN);
  }

  return (
    <KeyboardAvoidingView
      behavior="padding"
      className="flex-1 bg-white dark:bg-neutral-1"
    >
      <SafeAreaView className="flex-1 px-8">
        <View className="flex-1 space-y-6">
          <View className="space-y-3">
            <Text className="font-primary-bold text-neutral-1 dark:text-white pt-8 text-2xl">
              Would you like to receive notifications?
            </Text>
            <Text className="font-primary-regular text-neutral-2 dark:text-neutral-5 text-base">
              We'll use it to let you know when you have new movie matches
            </Text>
            <Text className="font-primary-regular text-neutral-2 dark:text-neutral-5 text-base">
              You can skip this step
            </Text>
          </View>

          <View className="flex-1 justify-end pb-8">
            <Button onPress={onAllow}>Allow Notifications</Button>
            <Button kind="text" onPress={onSkip}>
              {!joinedMailingList ? "No, thanks again 😅" : "No, thanks 😅"}
            </Button>
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
