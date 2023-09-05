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
    "cBQo4RdCRQ-3o8zQixf3ek:APA91bEpq7hBDnumHDWrdwKFpwdgrsx9w-f8Ze4-2sJFG8kAXrztT3WyZOvuO0UfrN9hZXHoMiog7Vreu-Q58rr7aPD3OEGFeN7hxTavOVWk4KNthxtopAKmna6Ycx7nEJJIz7piy4Km";

  const r = await app.messaging().send({
    notification: {
      title: "Test Notification",
      body: "Test Body",
    },
    token,
  });

  console.log({r});
}
