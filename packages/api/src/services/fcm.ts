import { env } from "../utils/env";

const admin = require("firebase-admin");

const app = admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(env.FIREBASE_CONFIG)),
});

export async function sendNotification({
  title,
  body,
  token,
  link,
}: {
  token: string;
  title: string;
  body: string;
  link?: string;
}) {
  await app.messaging().send({
    notification: {
      title,
      body,
    },
    data: {
      title,
      body,
      link,
    },
    android: {
      priority: "high",
    },
    apns: {
      payload: {
        aps: {
          contentAvailable: true,
        },
      },
    },
    token,
  });
}
