import { useState } from "react";
import { Text, TextInput, View, ViewProps } from "react-native";
import { twJoin } from "tailwind-merge";

import { api } from "~/utils/api";
import { Button, TouchableScale } from "~/components";
import { MainLayout } from "./layouts/MainLayout";
import Toast from "react-native-toast-message";
import {useNavigation} from "~/hooks";

export const SCREEN_FEEDBACK = "FeedbackScreen";

export function FeedbackScreen() {
  const [option, setOption] = useState(0);
  const [message, setMessage] = useState("");

  const feedback = api.feedback.submit.useMutation({
    onSuccess() {
      Toast.show({
        type: "success",
        text1: "Feedback submitted!",
        text2: "Thank you for your feedback!",
      })
    }
  });

  const navigation = useNavigation();

  function onSubmit() {
    feedback.mutate({
      rating: option,
      message,
    });

    navigation.goBack();
  }

  function onRate(rating: number) {
    setOption(rating);
  }

  return (
    <MainLayout canGoBack title="Share Feedback">
      <View className="space-y-2 pb-4">
        <Text className="font-primary-bold text-2xl text-neutral-1 dark:text-white">
          How are you feeling about MoviePals? 🤔
        </Text>
        <Text className="font-primary-regular text-base text-neutral-2 dark:text-neutral-5">
          Share your ideas on how MoviePals can be better.
        </Text>
      </View>

      <View className="space-x-3 items-center flex-row justify-center">
        <RatingOption
          onPress={() => onRate(1)}
          emoji="😡"
          selected={option === 0 || option === 1}
        />
        <RatingOption
          onPress={() => onRate(2)}
          emoji="😕"
          selected={option === 0 || option === 2}
        />
        <RatingOption
          onPress={() => onRate(3)}
          emoji="😐"
          selected={option === 0 || option === 3}
        />
        <RatingOption
          onPress={() => onRate(4)}
          emoji="😊"
          selected={option === 0 || option === 4}
        />
        <RatingOption
          onPress={() => onRate(5)}
          emoji="😍"
          selected={option === 0 || option === 5}
        />
      </View>

      <TextInput
        placeholder="Write your feedback here"
        multiline
        className="font-primary-bold h-36 text-base text-neutral-1 dark:text-white bg-neutral-2-10 dark:bg-neutral-2-20 rounded-xl mt-8 p-3"
        placeholderTextColor="#71706A"
        onChangeText={(v) => setMessage(v)}
      />
      <View className="flex-1" />
      <Button onPress={onSubmit}>Submit</Button>
    </MainLayout>
  );
}

function RatingOption({
  emoji,
  onPress,
  selected,
  ...rest
}: { emoji: string; selected: boolean; onPress: () => void } & ViewProps) {
  return (
    <TouchableScale
      onPress={onPress}
      className={twJoin(
        "bg-neutral-2-20 dark:bg-neutral-2-20 h-12 w-12 rounded-full items-center justify-center",
        selected ? "opacity-100" : "opacity-50",
      )}
      {...rest}
    >
      <Text className="text-3xl">{emoji}</Text>
    </TouchableScale>
  );
}
