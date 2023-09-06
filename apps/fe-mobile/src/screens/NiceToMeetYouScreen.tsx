import { useEffect } from "react";
import { View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

import { useNavigation } from "~/hooks";
import { SCREEN_CHECK_INVITE } from "./CheckInviteScreen";
import {SCREEN_ONBOARDING_SEND_INVITE} from "./OnboardingSendInviteScreen";

export const SCREEN_NICE_TO_MEET_YOU = "NiceToMeetYouScreen";

export function NiceToMeetYouScreen() {
  const navigation = useNavigation();

  useEffect(() => {
    const t = setTimeout(async () => {
      navigation.navigate(SCREEN_ONBOARDING_SEND_INVITE);
    }, 1400);

    return () => clearTimeout(t);
  }, []);

  return (
    <View className="flex-1 px-8 bg-white dark:bg-neutral-1 justify-center items-center">
      <Animated.View entering={FadeIn.duration(600).delay(300)}>
        <Animated.Text className="font-primary-bold text-neutral-1 dark:text-white text-2xl text-center">
          Sweet! Nice to{"\n"}meet you! 🤝
        </Animated.Text>
      </Animated.View>
    </View>
  );
}
