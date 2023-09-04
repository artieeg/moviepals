import { KeyboardAvoidingView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "~/components";
import { useNavigation } from "~/hooks";
import {SCREEN_JOIN_MAILING_LIST} from "./JoinMailingListScreen";

export const SCREEN_ONBOARDING_SEND_INVITE = "OnboardingSendInviteScreen";

export function OnboardingSendInviteScreen() {
  const navigation = useNavigation();

  function onSkip() {
    navigation.navigate(SCREEN_JOIN_MAILING_LIST, {
      joinedMailingList: false,
    });
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
              MoviePals is more{"\n"}fun together 🤩
            </Text>
            <Text className="font-primary-regular text-neutral-2 dark:text-neutral-5 text-base">
              Would you like to invite people you want to watch movies with?
            </Text>
            <Text className="font-primary-regular text-neutral-2 dark:text-neutral-5 text-base">
              If at least 3 people accept your invite, all of you will get
              premium access for free!
            </Text>
          </View>

          <View className="flex-1 items-end justify-end pb-8">
            <Button kind="text" onPress={onSkip}>
              Do it later
            </Button>
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
