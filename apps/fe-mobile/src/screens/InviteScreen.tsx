import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Linking,
  Platform,
  Text,
  View,
  ViewProps,
} from "react-native";
import { Contact, getAll } from "react-native-contacts";
import { check, PERMISSIONS, request } from "react-native-permissions";
import SendSMS from "react-native-sms";
import { Toast } from "react-native-toast-message/lib/src/Toast";
import Clipboard from "@react-native-clipboard/clipboard";
import { useFocusEffect } from "@react-navigation/native";
import { FlashList } from "@shopify/flash-list";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Copy, MessageText, Search } from "iconoir-react-native";
import { useDebounce } from "use-debounce";

import { api } from "~/utils/api";
import { Button, Input, ListItem, Prompt } from "~/components";
import { useNavigation } from "~/hooks";
import { SCREEN_INVITE_SUCCESS } from "./InviteSuccessScreen";
import { MainLayout } from "./layouts/MainLayout";

export const SCREEN_INVITE = "InviteScreen";

export function InviteScreen() {
  const permission = useContactsPermission();
  const request = useContactsPermissionRequest({
    onSuccess() {
      permission.refetch();
    },
  });

  const inviteUrl = api.invite.fetchInviteUrl.useQuery();
  const navigation = useNavigation();

  const contacts = useQuery(
    ["contacts"],
    async () => {
      return getAll();
    },
    { enabled: permission.data === "granted" },
  );

  async function onInvite() {
    const s = await Clipboard.getString();

    if (!inviteUrl.isSuccess) return;

    SendSMS.send(
      {
        body: `Hey! Let's pick a movie to watch together using ${inviteUrl.data.link}`,
        recipients: selected.map((s) => s.phoneNumbers[0].number),
      },
      (completed, cancelled, error) => {
        if (completed) {
          navigation.replace(SCREEN_INVITE_SUCCESS);
        }

        if (error) {
          Toast.show({
            type: "error",
            text1: "Something went wrong",
          });
        }
      },
    );
  }

  const [linkCopied, setLinkCopied] = useState(false);

  const onCopyLink = useCallback(() => {
    if (!inviteUrl.isSuccess) return;

    Clipboard.setString(inviteUrl.data.link);
    setLinkCopied(true);
  }, [inviteUrl.isSuccess, inviteUrl.data?.link]);

  useFocusEffect(
    useCallback(() => {
      permission.refetch();
    }, []),
  );

  function onRequestPermission() {
    request.mutate();
  }

  function onOpenSettings() {
    Linking.openSettings();
  }

  const [_query, setQuery] = useState("");
  const [query] = useDebounce(_query, 500);

  const [selected, setSelected] = useState<Contact[]>([]);

  const filteredContacts = useMemo(() => {
    if (!contacts.isSuccess) return [];

    if (!query) return contacts.data;

    return contacts.data.filter((c) => {
      return (
        c.givenName?.toLowerCase().includes(query.toLowerCase()) ||
        c.displayName?.toLowerCase().includes(query.toLowerCase()) ||
        c.phoneNumbers?.[0].number
          ?.toLowerCase()
          .includes(query.toLowerCase()) ||
        c.familyName?.toLowerCase().includes(query.toLowerCase())
      );
    });
  }, [contacts, query]);

  function onToggle(contact: Contact) {
    setSelected((s) =>
      s.some((c) => c.recordID === contact.recordID)
        ? s.filter((c) => c.recordID !== contact.recordID)
        : [...s, contact],
    );
  }

  const renderContactItem = useCallback(
    ({ item }: { item: Contact }) => {
      return (
        <ContactItem
          selected={selected.some((s) => s.recordID === item.recordID)}
          onToggle={onToggle}
          contact={item}
        />
      );
    },
    [selected],
  );

  const renderItemSeparator = useCallback(() => {
    return <View className="h-4" />;
  }, []);

  const renderListHeader = useCallback(() => {
    return (
      <View className="mb-4 space-y-4">
        <Input onChangeText={setQuery} placeholder="Search" icon={<Search />} />

        <ListItem
          icon={<Copy />}
          onPress={onCopyLink}
          right={undefined}
          itemId="copy-link"
          title={linkCopied ? "Link copied" : "Copy invite link"}
          subtitle="Send the link via any app"
        />
      </View>
    );
  }, [linkCopied, onCopyLink]);

  return (
    <MainLayout canGoBack title="Invites">
      <View className="space-y-1">
        <Text className="font-primary-bold text-neutral-1 dark:text-white text-2xl">
          Swipe Together
        </Text>
        <Text className="font-primary-regular text-neutral-2 dark:text-neutral-5 text-base">
          Select people you want to pick movies with. Pressing the “invite”
          button will open your messenger app with a pre-filled message.
        </Text>
      </View>

      {permission.isSuccess && permission.data === "granted" ? (
        <>
          {contacts.isLoading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="black" />
            </View>
          ) : (
            <>
              <FlatList
                extraData={selected.length}
                className="-mx-8"
                ItemSeparatorComponent={renderItemSeparator}
                ListHeaderComponent={renderListHeader}
                contentContainerStyle={{
                  paddingHorizontal: 32,
                  paddingTop: 32,
                  paddingBottom: 128,
                }}
                renderItem={renderContactItem}
                data={filteredContacts}
              />

              <View className="absolute bottom-0 left-8 right-8">
                <Button disabled={selected.length === 0} onPress={onInvite}>
                  Invite
                </Button>
              </View>
            </>
          )}
        </>
      ) : (
        <Prompt
          icon={<MessageText />}
          title="Contacts Permission"
          subtitle="We need your permission so we can fetch the list of people you can invite. This data won't be transferred or stored anywhere."
          buttons={[
            permission.data === "denied"
              ? {
                  title: "Allow Access",
                  onPress: onRequestPermission,
                }
              : {
                  title: "Open Settings",
                  onPress: onOpenSettings,
                },
            {
              kind: "outline",
              title: "Copy the link instead",
              onPress: onCopyLink,
            },
          ]}
        />
      )}
    </MainLayout>
  );
}

const CONTACTS_PERMISSION = Platform.select({
  ios: PERMISSIONS.IOS.CONTACTS,
  default: PERMISSIONS.ANDROID.READ_CONTACTS,
});

function useContactsPermissionRequest({
  onSuccess,
}: { onSuccess?: () => void } = {}) {
  return useMutation(
    async () => {
      const status = await request(CONTACTS_PERMISSION);
      console.log("requesting", status);

      return status;
    },
    { onSuccess },
  );
}

function useContactsPermission() {
  return useQuery(["contacts", "permission"], async () => {
    const status = await check(CONTACTS_PERMISSION);
    return status;
  });
}

function ContactItem({
  contact,
  onToggle,
  selected,
  ...rest
}: ViewProps & {
  contact: Contact;
  onToggle: (id: Contact) => void;
  selected: boolean;
}) {
  const name = useMemo(() => {
    if (!contact.givenName && contact.familyName) {
      return contact.familyName;
    }

    if (!contact.familyName && contact.givenName) {
      return contact.givenName;
    }

    if (!contact.familyName && !contact.givenName) {
      if (contact.displayName) {
        return contact.displayName;
      } else {
        return "Unknown";
      }
    }

    if (contact.familyName && contact.givenName) {
      return `${contact.givenName} ${contact.familyName}`;
    }

    return "Unknown";
  }, [contact]);

  return (
    <ListItem
      {...rest}
      checked={selected}
      onPress={() => onToggle(contact)}
      right="checkbox"
      onToggle={() => onToggle(contact)}
      itemId={contact.recordID}
      title={name}
      subtitle={contact.phoneNumbers?.[0]?.number}
    />
  );
}
