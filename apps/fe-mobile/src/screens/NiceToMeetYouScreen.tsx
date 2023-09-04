import { useEffect } from "react";
import Animated, {FadeIn} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import Clipboard from "@react-native-clipboard/clipboard";

import { useNavigation } from "~/hooks";
import { SCREEN_CHECK_INVITE } from "./CheckInviteScreen";
import { SCREEN_JOIN_MAILING_LIST } from "./JoinMailingListScreen";

export const SCREEN_NICE_TO_MEET_YOU = "NiceToMeetYouScreen";

export function NiceToMeetYouScreen() {
  const navigation = useNavigation();

  useEffect(() => {
    const t = setTimeout(async () => {
      if (await Clipboard.hasURL()) {
        navigation.navigate(SCREEN_CHECK_INVITE);
      } else {
        navigation.navigate(SCREEN_JOIN_MAILING_LIST);
      }
    }, 1200);

    return () => clearTimeout(t);
  }, []);

  return (
    <SafeAreaView className="flex-1 px-8 bg-white dark:bg-neutral-1 justify-center items-center">
      <Animated.Text entering={FadeIn.duration(400)} className="font-primary-bold text-neutral-1 dark:text-white pt-8 text-2xl text-center">
        Sweet, nice to{"\n"}meet you! 🤝
      </Animated.Text>
    </SafeAreaView>
  );
}
