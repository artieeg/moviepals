import { FirebaseMessagingTypes } from "@react-native-firebase/messaging";
import { z } from "zod";

const zRemoteMessageDataSchema = z.object({
  title: z.string(),
  body: z.string(),
  route: z.string(),
  extra: z.unknown(),
});

export type RemoteMessageData = z.infer<typeof zRemoteMessageDataSchema>;

export function handleRemoteMessage(
  message: FirebaseMessagingTypes.RemoteMessage,
) {}
