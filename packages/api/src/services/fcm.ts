import { z } from "zod";

import { env } from "../utils/env";

const admin = require("firebase-admin");

//Make sure the FIREBASE_CONFIG env variable is set
//to the contents of the firebase config file
console.log(admin.credential.applicationDefault());

const app = admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(env.FIREBASE_CONFIG)),
});

export async function sendNotification({
  title,
  body,
  token,
}: {
  token: string;
  title: string;
  body: string;
}) {
  await app.messaging().send({
    notification: {
      title,
      body,
    },
    token,
  });
}

export async function run() {
  const token =
    "e5c20SYuTzWe5LeojEq-WT:APA91bECeZ3WQkvb6l0a-nAjMEu9jaVnVRgMGcR0YkMD3pleDCwrdX5ub-fqWLt-n8bgNeABgJSjbVlu7bHihHZqBcUzmZRrF5_VZ_wsiOHs2DrzQKuZs2AZ426Yy0Y2q5pAUOeA2Qrr";

  const r = await app.messaging().send({
    notification: {
      title: "Test Notification",
      body: "Test Body",
    },
    token,
  });

  console.log({r});
}
