import { KeyboardAvoidingView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import messaging from "@react-native-firebase/messaging";

import { api } from "~/utils/api";
import { Button } from "~/components";
import {
  useFCMPermission,
  useFCMPermissionRequest,
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

  const permission = useFCMPermission();
  const requestPermission = useFCMPermissionRequest({
    onSuccess(state: any) {
      if (state === messaging.AuthorizationStatus.AUTHORIZED) {
        allowPushNotifications.mutate();
      }
    },
  });

  const allowPushNotifications = api.user.allowPushNotifications.useMutation({
    onMutate() {
      navigation.navigate(NAVIGATOR_MAIN);
    },
  });

  function onAllow() {
    if (permission.data !== messaging.AuthorizationStatus.AUTHORIZED) {
      requestPermission.mutate();
    } else {
      allowPushNotifications.mutate();
    }
  }

  function onSkip() {
    //navigation.navigate()
  }

  return (
    <KeyboardAvoidingView behavior="padding" className="flex-1 bg-white">
      <SafeAreaView className="flex-1 px-8">
        <View className="flex-1 space-y-6">
          <View className="space-y-3">
            <Text className="font-primary-bold text-neutral-1 pt-8 text-2xl">
              One last thing... 🙏
            </Text>
            <Text className="font-primary-regular text-neutral-2 text-base">
              Is it cool if we send you notifications?
            </Text>
            <Text className="font-primary-regular text-neutral-2 text-base">
              We'll use it to let you know when you have new movie matches with
              friends
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
