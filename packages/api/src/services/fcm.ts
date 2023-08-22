const fcm = require("firebase-admin");

//Make sure the FIREBASE_CONFIG env variable is set
//to the contents of the firebase config file
const app = fcm.initializeApp();

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
