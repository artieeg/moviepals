import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Text,
  View,
  ViewProps,
} from "react-native";
import { Contact, getAll } from "react-native-contacts";
import { check, PERMISSIONS, request } from "react-native-permissions";
import SendSMS from "react-native-sms";
import { FlashList } from "@shopify/flash-list";
import { useMutation, useQuery } from "@tanstack/react-query";
import { MessageText } from "iconoir-react-native";

import { api } from "~/utils/api";
import { Button, ListItem } from "~/components";
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

  const contacts = useQuery(
    ["contacts"],
    async () => {
      return getAll();
    },
    { enabled: permission.data === "granted" },
  );

  function onInvite() {
    if (!inviteUrl.isSuccess) return;

    SendSMS.send(
      {
        body: `Hey! Let's pick a movie to watch together using ${inviteUrl.data.link}`,
        recipients: selected.map((s) => s.phoneNumbers[0].number),
      },
      (completed) => {
        console.log(completed);
      },
    );
  }

  function onCopyLink() {}

  function onRequestPermission() {
    request.mutate();
  }

  const [selected, setSelected] = useState<Contact[]>([]);

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

  return (
    <MainLayout canGoBack title="Invites">
      <View className="space-y-1">
        <Text className="font-primary-bold text-neutral-1 text-2xl">
          Swipe Together
        </Text>
        <Text className="font-primary-regular text-neutral-2 text-base">
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
                extraData={selected}
                className="-mx-8"
                contentContainerStyle={{
                  paddingHorizontal: 32,
                  paddingTop: 32,
                  paddingBottom: 128,
                }}
                renderItem={renderContactItem}
                data={contacts.data}
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
        <View className="mt-8 flex-1">
          <View className="flex-1 items-center justify-center">
            <View className="bg-brand-1-10 h-20 w-20 items-center justify-center rounded-2xl">
              <MessageText
                color="#6867AA"
                fill="#6867AA"
                width={32}
                height={32}
              />
            </View>

            <View className="mt-4 items-center justify-center space-y-2">
              <Text className="font-primary-bold text-xl">
                We need your permission
              </Text>
              <Text className="font-primary-regular text-neutral-2 text-center text-base">
                We need your permission so we can fetch the list of people you
                can invite
              </Text>
            </View>
          </View>

          <View className="mb-4 space-y-4">
            <Button onPress={onRequestPermission}>Allow Access</Button>

            <Button onPress={onCopyLink} kind="outline">
              Copy the link instead
            </Button>
          </View>
        </View>
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
