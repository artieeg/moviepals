import React from "react";
import { Text, View } from "react-native";
import Share from "react-native-share";
import SendSMS from "react-native-sms";
import Toast from "react-native-toast-message";
import Clipboard from "@react-native-clipboard/clipboard";
import {
  ClipboardCheck,
  Mail,
  MessageText,
  PasteClipboard,
} from "iconoir-react-native";

import { api } from "~/utils/api";
import { sendEvent } from "~/utils/plausible";
import { ListItem } from "./ListItem";

export function InviteOptions({
  onLinkCopied,
  linkCopied,
  onApplyInvite,
  showActivateInvite,
}: {
  onLinkCopied?: () => void;
  linkCopied: boolean;
  onApplyInvite?: () => void;
  showActivateInvite?: boolean;
}) {
  const inviteUrl = api.invite.fetchInviteUrl.useQuery();

  function onText() {
    if (!inviteUrl.isSuccess) {
      return;
    }

    sendEvent("send_invite_text");

    SendSMS.send(
      {
        successTypes: ["all"] as any,
        recipients: [],
        body: `Hey, let's pick a movie to watch together with MoviePals! ${inviteUrl.data.link}`,
      },
      (_completed, _cancelled, error) => {
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

    sendEvent("copy_invite_link");

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
        title="Send an invite text"
        onPress={onText}
        icon={<MessageText />}
        subtitle="We'll open your SMS app"
      />

      {!showActivateInvite && (
        <View className="flex-row items-center -mx-8">
          <View className="h-px bg-neutral-3 dark:bg-neutral-2-50 flex-1" />
          <Text className="font-primary-regular text-neutral-2 dark:text-neutral-5 text-base px-8">
            or
          </Text>
          <View className="h-px bg-neutral-3 dark:bg-neutral-2-50 flex-1" />
        </View>
      )}

      <ListItem
        right={undefined}
        itemId="copy-invite-link"
        onPress={onCopyInviteLink}
        title={linkCopied ? "Link copied" : "Copy my invite link"}
        icon={linkCopied ? <ClipboardCheck /> : <PasteClipboard />}
        subtitle={linkCopied ? "Time to share it!" : "Share it yourself"}
      />

      {showActivateInvite && (
        <View className="flex-row items-center -mx-8">
          <View className="h-px bg-neutral-3 dark:bg-neutral-2-50 flex-1" />
          <Text className="font-primary-regular text-neutral-2 dark:text-neutral-5 text-base px-8">
            or
          </Text>
          <View className="h-px bg-neutral-3 dark:bg-neutral-2-50 flex-1" />
        </View>
      )}

      {showActivateInvite && (
        <ListItem
          right={undefined}
          itemId="copy-invite-link"
          onPress={onApplyInvite}
          title={"I received an invite"}
          icon={<Mail />}
          subtitle={"Apply my invite"}
        />
      )}
    </View>
  );
}
