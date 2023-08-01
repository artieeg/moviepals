import { useState } from "react";
import {
  KeyboardAvoidingView,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { ArrowRight } from "iconoir-react-native";

import { api } from "~/utils/api";
import { IconButton } from "~/components/IconButton";
import { useNavigation } from "~/hooks";
import { NAVIGATOR_MAIN } from "~/navigators/RootNavigator";
import { useOnboardingStore } from "~/stores";

export function WhatsYourNameScreen() {
  const navigation = useNavigation();

  const createNewAccount = api.user.createNewAccount.useMutation({
    onSuccess() {
      navigation.navigate(NAVIGATOR_MAIN);
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
    <KeyboardAvoidingView behavior="padding" className="flex-1">
      <SafeAreaView className="flex-1 bg-white px-8">
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

function Input({ style, ...rest }: TextInputProps) {
  return (
    <View style={style} className="bg-neutral-2-10 h-12 rounded-full">
      <TextInput
        className="font-primary-bold h-full w-full px-4"
        placeholderTextColor="#71707B"
        {...rest}
      />
    </View>
  );
}
