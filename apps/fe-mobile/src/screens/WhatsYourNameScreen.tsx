import React, {
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  KeyboardAvoidingView,
  Linking,
  Pressable,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import EmojiSelector from "react-native-emoji-selector";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import Clipboard from "@react-native-clipboard/clipboard";
import { ArrowRight, AtSign } from "iconoir-react-native";

import { api, setAuthToken } from "~/utils/api";
import { IconButton } from "~/components/IconButton";
import { Input, ListItem } from "~/components";
import { useNavigation } from "~/hooks";
import { useOnboardingStore } from "~/stores";
import { SCREEN_CHECK_INVITE } from "./CheckInviteScreen";
import { SCREEN_JOIN_MAILING_LIST } from "./JoinMailingListScreen";

export function WhatsYourNameScreen() {
  const navigation = useNavigation();

  const createNewAccount = api.user.createNewAccount.useMutation({
    async onSuccess({ token }) {
      await setAuthToken(token);

      if (await Clipboard.hasURL()) {
        navigation.navigate(SCREEN_CHECK_INVITE);
      } else {
        navigation.navigate(SCREEN_JOIN_MAILING_LIST);
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
  const [emoji, setEmoji] = useState("😃");
  const name = useOnboardingStore((state) => state.name);
  const method = useOnboardingStore((state) => state.method);

  function onChangeName(name: string) {
    useOnboardingStore.setState({ name });
  }

  const emojiPickerBottomSheetRef = useRef<EmojiPickerBottomSheetRef>(null);

  function onEmojiSelected(emoji: string) {
    setEmoji(emoji);
    emojiPickerBottomSheetRef.current?.close();
  }

  function onPickEmoji() {
    emojiPickerBottomSheetRef.current?.open();
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
      emoji
    });
  }



  return (
    <KeyboardAvoidingView behavior="padding" className="flex-1 bg-white">
      <SafeAreaView className="flex-1 px-8">
        <View className="flex-1 space-y-6">
          <View className="space-y-3">
            <Text className="font-primary-bold text-neutral-1 pt-8 text-2xl">
              Hey, introduce{"\n"}yourself please 😄
            </Text>
            <Text className="font-primary-regular text-neutral-2 text-base">
              Your friends will be able to find you by your username
            </Text>
          </View>

          <View className="space-y-4">
            <ListItem
              icon={emoji}
              onPress={onPickEmoji}
              itemId="emoji"
              right={undefined}
              title="Emoji Avatar"
              subtitle="Pick an emoji to represent you"
            />
            <Input
              placeholder="your name"
              value={name!}
              onChangeText={onChangeName}
            />
            <Input
              icon={<AtSign />}
              autoCapitalize="none"
              maxLength={32}
              placeholder="username"
              onChangeText={setUsername}
              autoFocus
              value={username}
            />
            <View className="flex-row">
              <Text className="font-primary-regular text-neutral-2 text-sm">
                By continuing, you agree to our{" "}
                <Pressable
                  className="translate-y-[3px]"
                  onPress={() => {
                    Linking.openURL("https://moviepals.io/privacy-policy");
                  }}
                >
                  <Text className="font-primary-regular text-neutral-2 text-sm underline">
                    Privacy Policy
                  </Text>
                </Pressable>{" "}
                and{" "}
                <Pressable
                  className="translate-y-[3px]"
                  onPress={() => {
                    Linking.openURL("https://moviepals.io/terms-of-service");
                  }}
                >
                  <Text className="font-primary-regular text-neutral-2 text-sm underline">
                    Terms of Service
                  </Text>
                </Pressable>
              </Text>
            </View>
          </View>
        </View>
        <View className="flex-1 items-end justify-end pb-8">
          <IconButton onPress={onSubmit} variant="primary">
            <ArrowRight width="24" height="24" color="#ffffff" />
          </IconButton>
        </View>
      </SafeAreaView>

      <EmojiPickerBottomSheet onEmojiSelected={onEmojiSelected} ref={emojiPickerBottomSheetRef} />
    </KeyboardAvoidingView>
  );
}

export type EmojiPickerBottomSheetRef = {
  open(): void;
  close(): void;
};

export const EmojiPickerBottomSheet = React.forwardRef<
  EmojiPickerBottomSheetRef,
  {
    onEmojiSelected(emoji: string): void;
  }
>(({onEmojiSelected}, ref) => {
  const bottomSheetRef = useRef<BottomSheet>(null);

  useImperativeHandle(ref, () => ({
    open() {
      bottomSheetRef.current?.expand();
    },
    close() {
      bottomSheetRef.current?.close();
    },
  }));

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
      />
    ),
    [],
  );

  const { height } = useWindowDimensions();

  return (
    <BottomSheet
      ref={bottomSheetRef}
      onClose={() => {}}
      index={-1}
      enableContentPanningGesture={false}
      snapPoints={[height * 0.8]}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
    >
      <EmojiSelector theme="#6867AA" onEmojiSelected={onEmojiSelected} />
    </BottomSheet>
  );
});
