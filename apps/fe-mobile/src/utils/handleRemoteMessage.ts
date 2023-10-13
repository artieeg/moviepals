import { Linking } from "react-native";
import PushNotification, {
  Importance,
} from "react-native-push-notification";
import PushNotificationIOS from "@react-native-community/push-notification-ios";
import { FirebaseMessagingTypes } from "@react-native-firebase/messaging";
import { z } from "zod";
import {deepLinkLockState} from "./deep-link-lock";

const zRemoteMessageDataSchema = z.object({
  title: z.string(),
  body: z.string(),
  bigText: z.string().optional(),
  link: z.string().optional(),
  sound: z.boolean().default(false),
});

export type RemoteMessageData = z.infer<typeof zRemoteMessageDataSchema>;

export async function handleRemoteMessage(
  message: FirebaseMessagingTypes.RemoteMessage,
) {
  const data = zRemoteMessageDataSchema.parse(message.data);

  PushNotification.createChannel(
    {
      channelId: "channel",
      channelName: "MoviePals",
      channelDescription: "MoviePals notifications",
      playSound: false,
      soundName: "default",
      importance: Importance.HIGH,
      vibrate: true,
    },
    () => {},
  );

  PushNotification.localNotification({
    channelId: "channel",
    smallIcon: "ic_notification",
    bigText: data.bigText,
    subText: data.body,
    bigLargeIcon: "ic_launcher",
    vibrate: false,

    title: data.title,
    message: data.body,
    userInfo: {
      link: data.link,
    },
    invokeApp: false,
    playSound: data.sound,
    soundName: "default",
  });
}

PushNotification.configure({
  onNotification: function (notification) {
    if (notification.data.link) {
      deepLinkLockState.locked = true;

      setTimeout(() => {
        Linking.openURL(notification.data.link);
      }, 1000);
    }

    notification.finish(PushNotificationIOS.FetchResult.NoData);
  },

  onRegistrationError: function (err) {
    console.error(err.message, err);
  },

  requestPermissions: false,

  permissions: {
    alert: true,
    badge: true,
    sound: true,
  },

  popInitialNotification: true,
});
