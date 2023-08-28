import React, {
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Text, useWindowDimensions, View } from "react-native";
import EmojiSelector from "react-native-emoji-selector";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Toast from "react-native-toast-message";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import { ArrowRight, AtSign, Check } from "iconoir-react-native";
import { produce } from "immer";

import { api } from "~/utils/api";
import { IconButton } from "~/components/IconButton";
import { Input, ListItem } from "~/components";
import { useNavigation } from "~/hooks";
import { MainLayout } from "./layouts/MainLayout";

export const SCREEN_USER_SETTINGS = "UserSettingsScreen";

export function UserSettingsScreen() {
  const ctx = api.useContext();

  const navigation = useNavigation();

  const user = api.user.getMyData.useQuery();

  const updateUser = api.user.updateUser.useMutation({
    async onMutate({ username, name, emoji }) {
      ctx.user.getMyData.setData(
        undefined,
        produce((draft) => {
          if (!draft) return;

          draft.name = name;
          draft.username = username;
          draft.emoji = emoji;
        }),
      );
    },
    async onSuccess() {
      await ctx.user.getMyData.invalidate();
    },
    onError(e) {
      Toast.show({
        type: "error",
        text1: e.message,
      });
    },
  });

  const [username, setUsername] = useState<string>(user.data?.username ?? "");
  const [emoji, setEmoji] = useState(user.data?.emoji ?? "😃");
  const [name, setName] = useState(user.data?.name ?? "");

  function onChangeName(name: string) {
    setName(name);
  }

  const emojiPickerBottomSheetRef = useRef<EmojiPickerBottomSheetRef>(null);

  function onEmojiSelected(emoji: string) {
    setEmoji(emoji);
    emojiPickerBottomSheetRef.current?.close();
  }

  function onPickEmoji() {
    emojiPickerBottomSheetRef.current?.open();
  }

  async function onSubmit() {
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

    await updateUser.mutateAsync({
      name,
      username,
      emoji,
    });

    navigation.goBack();
  }

  return (
    <>
      <MainLayout canGoBack title="Settings">
        <KeyboardAwareScrollView className="flex-1">
          <View className="space-y-6">
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
                autoCorrect={false}
                autoComplete="username"
                maxLength={32}
                placeholder="username"
                onChangeText={setUsername}
                autoFocus
                value={username}
              />
            </View>
          </View>
        </KeyboardAwareScrollView>
        <View className="absolute right-8 bottom-8">
          <IconButton
            loading={updateUser.isLoading}
            onPress={onSubmit}
            variant="primary"
          >
            <Check width="24" height="24" color="#ffffff" />
          </IconButton>
        </View>
      </MainLayout>

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
