import React, {
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Keyboard, Platform, Text, useWindowDimensions, View } from "react-native";
import EmojiSelector from "react-native-emoji-selector";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import { ArrowRight, AtSign } from "iconoir-react-native";

import { api, setAuthToken } from "~/utils/api";
import { IconButton } from "~/components/IconButton";
import { Input, ListItem } from "~/components";
import { useNavigation } from "~/hooks";
import { useOnboardingStore } from "~/stores";
import { SCREEN_NICE_TO_MEET_YOU } from "./NiceToMeetYouScreen";

export function WhatsYourNameScreen() {
  const navigation = useNavigation();

  const createNewAccount = api.user.createNewAccount.useMutation({
    async onSuccess({ token }) {
      await setAuthToken(token);

      navigation.navigate(SCREEN_NICE_TO_MEET_YOU);
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

    Keyboard.dismiss();

    createNewAccount.mutate({
      name,
      username,
      method: method!,
      _dev: true,
      emoji,
    });
  }

  return (
    <>
      <SafeAreaView
        edges={{
          bottom: "maximum",
          top: "maximum",
          left: "maximum",
          right: "maximum",
        }}
        className="flex-1 bg-white dark:bg-neutral-1 px-8 pb-8"
      >
        <View className="space-y-6">
          <View className="space-y-3">
            <Text className="font-primary-bold text-neutral-1 dark:text-white pt-8 text-2xl">
              Hey, please introduce{"\n"}yourself 😄
            </Text>
            <Text className="font-primary-regular text-neutral-2 dark:text-neutral-5 text-base">
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
              autoFocus
              returnKeyType={Platform.select({ios: "join", default: "next"})}
              autoCorrect={false}
              autoComplete="username"
              onSubmitEditing={onSubmit}
              onChangeText={setUsername}
              value={username}
            />
          </View>
        </View>
        <View className="flex-1 justify-end items-end">
          <IconButton
            loading={createNewAccount.isLoading}
            onPress={onSubmit}
            variant="primary"
          >
            <ArrowRight width="24" height="24" color="#ffffff" />
          </IconButton>
        </View>
      </SafeAreaView>

      <EmojiPickerBottomSheet
        onEmojiSelected={onEmojiSelected}
        ref={emojiPickerBottomSheetRef}
      />
    </>
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
>(({ onEmojiSelected }, ref) => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [renderEmoji, setRenderEmoji] = useState(false);

  useImperativeHandle(ref, () => ({
    open() {
      setRenderEmoji(true);
      bottomSheetRef.current?.expand();
    },
    close() {
      setRenderEmoji(false);
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
      onClose={() => {
        setRenderEmoji(false);
      }}
      index={-1}
      enableContentPanningGesture={false}
      snapPoints={[height * 0.8]}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
    >
      {renderEmoji && (
        <EmojiSelector theme="#6867AA" onEmojiSelected={onEmojiSelected} />
      )}
    </BottomSheet>
  );
});
