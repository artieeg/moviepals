import React from "react";
import { Text, View } from "react-native";
import Share from "react-native-share";
import SendSMS from "react-native-sms";
import Toast from "react-native-toast-message";
import Clipboard from "@react-native-clipboard/clipboard";
import {
  ClipboardCheck,
  MessageText,
  PasteClipboard,
} from "iconoir-react-native";

import { api } from "~/utils/api";
import { ListItem } from "./ListItem";

export function InviteOptions({
  onLinkCopied,
  linkCopied,
}: {
  onLinkCopied?: () => void;
  linkCopied: boolean;
}) {
  const inviteUrl = api.invite.fetchInviteUrl.useQuery();

  function onText() {
    if (!inviteUrl.isSuccess) {
      return;
    }

    console.log(inviteUrl.data.link);

    SendSMS.send(
      {
        successTypes: ["all"] as any,
        recipients: [],
        body: `Hey, let's pick a movie to watch together with MoviePals! ${inviteUrl.data.link}`,
      },
      (completed, cancelled, error) => {
        console.log(completed, cancelled, error);

        if (error) {
          Toast.show({
            type: "error",
            text1: "Something went wrong",
            text2: "Please invite your friends manually",
          });
        }
      },
    );
  }

  function onCopyInviteLink() {
    if (!inviteUrl.isSuccess) {
      return;
    }

    Clipboard.setString(inviteUrl.data.link);

    onLinkCopied?.();

    setTimeout(() => {
      Share.open({
        message: `Hey, let's pick a movie to watch together with MoviePals! ${inviteUrl.data.link}`,
      });
    }, 1000);
  }

  return (
    <View className="space-y-3">
      <ListItem
        right={undefined}
        itemId="text-a-friend"
        title="Send a text"
        onPress={onText}
        icon={<MessageText />}
        subtitle="We'll open your SMS app."
      />
      <View className="flex-row items-center -mx-8">
        <View className="h-px bg-neutral-3 dark:bg-neutral-2-50 flex-1" />
        <Text className="font-primary-regular text-neutral-2 dark:text-neutral-5 text-base px-8">
          or
        </Text>
        <View className="h-px bg-neutral-3 dark:bg-neutral-2-50 flex-1" />
      </View>

      <ListItem
        right={undefined}
        itemId="copy-invite-link"
        onPress={onCopyInviteLink}
        title={linkCopied ? "Link copied" : "Copy my invite link"}
        icon={linkCopied ? <ClipboardCheck /> : <PasteClipboard />}
        subtitle={linkCopied ? "Time to share it!" : "and share it"}
      />
    </View>
  );
}
