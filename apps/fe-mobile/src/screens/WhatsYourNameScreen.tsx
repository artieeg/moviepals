import { useState } from "react";
import {
  KeyboardAvoidingView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { ArrowRight, AtSign } from "iconoir-react-native";

import { api, setAuthToken } from "~/utils/api";
import { IconButton } from "~/components/IconButton";
import { Input } from "~/components";
import { useNavigation } from "~/hooks";
import { NAVIGATOR_MAIN } from "~/navigators/RootNavigator";
import { useOnboardingStore } from "~/stores";
import Clipboard from "@react-native-clipboard/clipboard";
import {SCREEN_CHECK_INVITE} from "./CheckInviteScreen";

export function WhatsYourNameScreen() {
  const navigation = useNavigation();

  const createNewAccount = api.user.createNewAccount.useMutation({
    async onSuccess({ token }) {
      await setAuthToken(token);

      if (await Clipboard.hasURL()) {
        navigation.navigate(SCREEN_CHECK_INVITE);
      } else {
        navigation.navigate(NAVIGATOR_MAIN);
      }
    },
    onError(e) {
      Toast.show({
        type: "error",
        text1: e.message,
      });
    },
  });

  const [username, setUsername] = useState<string>();
  const name = useOnboardingStore((state) => state.name);
  const method = useOnboardingStore((state) => state.method);

  function onChangeName(name: string) {
    useOnboardingStore.setState({ name });
  }

  function onSubmit() {
    if (!username) {
      return Toast.show({
        type: "error",
        text1: "Username is required",
      });
    }

    if (!name) {
      return Toast.show({
        type: "error",
        text1: "Name is required",
      });
    }

    createNewAccount.mutate({
      name,
      username,
      method: method!,
    });
  }

  return (
    <KeyboardAvoidingView behavior="padding" className="flex-1 bg-white">
      <SafeAreaView className="flex-1 px-8">
        <View className="flex-1 space-y-6">
          <View className="space-y-2">
            <Text className="font-primary-bold text-neutral-1 pt-8 text-2xl">
              hey, what's your name?
            </Text>
            <Text className="font-primary-regular text-neutral-2 text-base">
              your friends will be able to discover your account by your
              username
            </Text>
          </View>

          <View className="space-y-4">
            <Input
              placeholder="your name"
              value={name!}
              onChangeText={onChangeName}
            />
            <Input
              icon={<AtSign />}
              autoCapitalize="none"
              placeholder="username"
              onChangeText={setUsername}
              autoFocus
              value={username}
            />
          </View>
        </View>
        <View className="flex-1 items-end justify-end">
          <IconButton onPress={onSubmit} variant="primary">
            <ArrowRight width="24" height="24" color="#ffffff" />
          </IconButton>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
