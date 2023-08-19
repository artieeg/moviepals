import { KeyboardAvoidingView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { api } from "~/utils/api";
import { Button } from "~/components";
import { useNavigation } from "~/hooks";
import { SCREEN_NOTIFICATION_PERMISSION } from "./NotificationPermissionRequestScreen";

export const SCREEN_JOIN_MAILING_LIST = "JoinMailingListScreen";

export function JoinMailingListScreen() {
  const navigation = useNavigation();

  const joinMailingList = api.user.joinMailingList.useMutation({
    onMutate() {
      navigation.navigate(SCREEN_NOTIFICATION_PERMISSION, {
        joinedMailingList: true,
      });
    },
  });

  function onJoin() {
    joinMailingList.mutate();
  }

  function onSkip() {
    navigation.navigate(SCREEN_NOTIFICATION_PERMISSION, {
      joinedMailingList: false,
    });
  }

  return (
    <KeyboardAvoidingView behavior="padding" className="flex-1 bg-white">
      <SafeAreaView className="flex-1 px-8">
        <View className="flex-1 space-y-6">
          <View className="space-y-3">
            <Text className="font-primary-bold text-neutral-1 pt-8 text-2xl">
              Sweet, nice to{"\n"}meet you! 🤝
            </Text>
            <Text className="font-primary-regular text-neutral-2 text-base">
              Would you like to join our mailing list? We share movie news, host
              trivia, and do other cool stuff
            </Text>
            <Text className="font-primary-regular text-neutral-2 text-base">
              If you agree, we'll send an invite to your email
            </Text>
          </View>

          <View className="flex-1 justify-end pb-8">
            <Button onPress={onJoin}>yep</Button>
            <Button kind="text" onPress={onSkip}>
              no, thanks
            </Button>
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
