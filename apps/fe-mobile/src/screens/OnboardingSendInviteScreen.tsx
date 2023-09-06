import { useState } from "react";
import { KeyboardAvoidingView, Text, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import Share from "react-native-share";
import SendSMS from "react-native-sms";
import Toast from "react-native-toast-message";
import Clipboard from "@react-native-clipboard/clipboard";
import {
  ArrowRight,
  ClipboardCheck,
  MessageText,
  PasteClipboard,
} from "iconoir-react-native";

import { api } from "~/utils/api";
import { Button, IconButton, InviteOptions, ListItem } from "~/components";
import { useNavigation } from "~/hooks";
import { SCREEN_CHECK_INVITE } from "./CheckInviteScreen";
import { SCREEN_INVITE } from "./InviteScreen";
import { SCREEN_JOIN_MAILING_LIST } from "./JoinMailingListScreen";

export const SCREEN_ONBOARDING_SEND_INVITE = "OnboardingSendInviteScreen";

export function OnboardingSendInviteScreen() {
  const [linkCopied, setLinkCopied] = useState(false);

  const navigation = useNavigation();

  function onLinkCopied() {
    setLinkCopied(true);
  }

  function onProceedCopied() {
    navigation.navigate(SCREEN_JOIN_MAILING_LIST);
  }

  function onSkip() {
    navigation.navigate(SCREEN_JOIN_MAILING_LIST);
  }

  function onApplyInvite() {
    navigation.navigate(SCREEN_CHECK_INVITE);
  }

  return (
    <KeyboardAvoidingView
      behavior="padding"
      className="flex-1 bg-white dark:bg-neutral-1"
    >
      <SafeAreaView
        edges={{
          top: "maximum",
          left: "maximum",
          right: "maximum",
          bottom: "maximum",
        }}
        className="flex-1 px-8 pb-8"
      >
        <View className="flex-1 space-y-6">
          <View className="space-y-3">
            <Animated.Text
              entering={FadeIn.duration(400)}
              className="font-primary-bold text-neutral-1 dark:text-white pt-8 text-2xl"
            >
              MoviePals is more{"\n"}fun together 🤩
            </Animated.Text>
            <Animated.Text
              entering={FadeIn.duration(400).delay(200)}
              className="font-primary-regular text-neutral-2 dark:text-neutral-5 text-base"
            >
              Would you like to invite people to find movies you all would like
              to watch?
            </Animated.Text>
            <Animated.Text
              entering={FadeIn.duration(400).delay(400)}
              className="font-primary-regular text-neutral-2 dark:text-neutral-5 text-base"
            >
              If at least 3 people accept your invite,
              <Text className="font-primary-bold text-neutral-2 dark:text-neutral-5 text-base">
                {" "}
                all of you{" "}
              </Text>
              will get premium access for free!
            </Animated.Text>
          </View>

          <Animated.View
            entering={FadeIn.duration(400).delay(600)}
            className="flex-1 pt-4 mt-8 space-y-5"
          >
            <InviteOptions
              onLinkCopied={onLinkCopied}
              showActivateInvite
              onApplyInvite={onApplyInvite}
              linkCopied={linkCopied}
            />
          </Animated.View>

          <View className="h-16 justify-end items-end">
            <Animated.View
              entering={FadeIn.duration(400).delay(linkCopied ? 100 : 1200)}
              exiting={FadeOut.duration(400).delay(100)}
              key={linkCopied.toString()}
              className="flex-row items-center"
            >
              {linkCopied ? (
                <IconButton onPress={onProceedCopied} variant="primary">
                  <ArrowRight width="24" height="24" color="#ffffff" />
                </IconButton>
              ) : (
                <Button kind="text" onPress={onSkip}>
                  Do it later
                </Button>
              )}
            </Animated.View>
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
