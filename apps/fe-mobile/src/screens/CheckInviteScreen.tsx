import React, { useCallback } from "react";
import { KeyboardAvoidingView, Linking, Platform, View } from "react-native";
import Animated, { FadeIn, Layout } from "react-native-reanimated";
import Toast from "react-native-toast-message";
import Clipboard from "@react-native-clipboard/clipboard";
import { useFocusEffect } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { Mail } from "iconoir-react-native";

import { api } from "~/utils/api";
import { Button, Input } from "~/components";
import { useNavigation, useRouteParams } from "~/hooks";
import { SCREEN_JOIN_MAILING_LIST } from "./JoinMailingListScreen";
import { MainLayout } from "./layouts/MainLayout";

export const SCREEN_CHECK_INVITE = "CheckInviteScreen";

export function CheckInviteScreen() {
  const { from } = useRouteParams<{ from?: string }>();

  const hasUrl = useQuery(["has-invite-url"], async () => {
    if (Platform.OS === "android") {
      const data = await Clipboard.getString();

      return data.includes("https://moviepals.io");
    } else {
      return Clipboard.hasURL();
    }
  });
  const [inviteCode, setInviteCode] = React.useState("");

  useFocusEffect(
    useCallback(() => {
      hasUrl.refetch();
    }, []),
  );

  const [somethingWentWrong, setSomethingWentWrong] = React.useState(false);

  const applyInvite = api.invite.applyInvite.useMutation({
    onSuccess({ inviter }) {
      Toast.show({
        type: "success",
        text1: `Accepted an invite from ${inviter.name}!`,
      });

      setTimeout(() => {
        if (from === "settings") {
          navigation.goBack();
        } else {
          navigation.replace(SCREEN_JOIN_MAILING_LIST);
        }
      }, 400);
    },
    onError(e) {
      setSomethingWentWrong(true);

      if (e.data?.code === "NOT_FOUND") {
        Toast.show({
          type: "error",
          text1: "This invite doesn't seem to exist",
          text2: "Please try to enter the code manually.",
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Failed to apply invite",
          text2: "Something went wrong, please try again later",
        });
      }
    },
  });

  const navigation = useNavigation();

  const [showManualInput, setShowManualInput] = React.useState(false);

  async function onSubmitInviteCode() {
    if (inviteCode.length !== 8) {
      return Toast.show({
        type: "error",
        text1: "Invalid invite code",
        text2: "Invite code should have 8 characters.",
      });
    }

    const inviteUrl = `https://moviepals.io/${inviteCode}`;

    applyInvite.mutate({ inviteUrl });
  }

  async function onCheckInvite() {
    const text = await Clipboard.getString();

    if (!text.includes("https://moviepals.io")) {
      setShowManualInput(true);

      return;
    }

    const inviteUrl = text.split(" ").find((s) => s.includes("https://"));

    if (!inviteUrl) {
      return Toast.show({
        type: "error",
        text1: "Failed to apply invite",
        text2: "Please enter invite code manually.",
      });
    }

    applyInvite.mutate({ inviteUrl });
  }

  function onSkip() {
    navigation.navigate(SCREEN_JOIN_MAILING_LIST);
  }

  function onContactSupport() {
    Linking.openURL("mailto:hey@moviepals.io");
  }

  return (
    <KeyboardAvoidingView behavior="padding" className="flex-1">
      <MainLayout
        edges={{
          top: "maximum",
          bottom: "maximum",
          left: "maximum",
          right: "maximum",
        }}
        className="pb-8"
        canGoBack
        title="Invites"
      >
        {hasUrl.isSuccess && (
          <View className="flex-1">
            <Animated.View className="flex-1 space-y-3">
              <Animated.Text
                entering={FadeIn.duration(400)}
                className="font-primary-bold text-neutral-1 dark:text-white text-2xl"
              >
                Let's apply your invite! 🤩
              </Animated.Text>
              <Animated.Text
                entering={FadeIn.duration(400).delay(200)}
                key={`${hasUrl.data}_line1`}
                className="font-primary-regular text-neutral-2 dark:text-neutral-5 text-base"
              >
                {hasUrl.data
                  ? "We'll try to automatically apply your invite from your clipboard."
                  : "Please enter your invite code."}
              </Animated.Text>
              {hasUrl.data && (
                <Animated.Text
                  entering={FadeIn.duration(400).delay(400)}
                  key={`${hasUrl.data}_line2`}
                  className="font-primary-regular text-neutral-2 dark:text-neutral-5 text-base"
                >
                  MoviePals may ask the permission to access your clipboard.
                </Animated.Text>
              )}
              {hasUrl.isSuccess && !hasUrl.data && (
                <Animated.View entering={FadeIn.duration(400).delay(400)}>
                  <Input
                    placeholder="Enter your invite code"
                    autoFocus
                    icon={<Mail />}
                    value={inviteCode}
                    onChangeText={setInviteCode}
                    onSubmitEditing={onSubmitInviteCode}
                    maxLength={8}
                    returnKeyType="done"
                  />
                </Animated.View>
              )}
            </Animated.View>

            {showManualInput || (hasUrl.isSuccess && !hasUrl.data) ? (
              <Animated.View layout={Layout} className="space-y-3">
                <Animated.View
                  layout={Layout}
                  entering={FadeIn.duration(400).delay(600)}
                >
                  <Button
                    disabled={inviteCode.length !== 8}
                    isLoading={applyInvite.isLoading}
                    onPress={onSubmitInviteCode}
                  >
                    Apply invite
                  </Button>
                </Animated.View>

                {somethingWentWrong && (
                  <Animated.View
                    layout={Layout}
                    entering={FadeIn.duration(400).delay(200)}
                    className="space-y-3"
                  >
                    <Button kind="outline" onPress={onContactSupport}>
                      Contact Support
                    </Button>
                  </Animated.View>
                )}

                {somethingWentWrong && (
                  <Animated.View
                    layout={Layout}
                    entering={FadeIn.duration(400).delay(200)}
                    className="space-y-3"
                  >
                    <Button kind="text" onPress={onSkip}>
                      Do it later
                    </Button>
                  </Animated.View>
                )}
              </Animated.View>
            ) : (
              <View>
                <Animated.View
                  entering={FadeIn.duration(400).delay(600)}
                  className="space-y-3"
                >
                  <Button
                    isLoading={applyInvite.isLoading}
                    onPress={onCheckInvite}
                  >
                    Apply invite
                  </Button>

                  <Button
                    kind="outline"
                    onPress={() => {
                      setShowManualInput(true);
                    }}
                  >
                    Enter invite manually
                  </Button>
                </Animated.View>
              </View>
            )}
          </View>
        )}
      </MainLayout>
    </KeyboardAvoidingView>
  );
}
