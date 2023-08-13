import crypto from "crypto";
import axios from "axios";

import { PrismaClient } from "@moviepals/db";

export async function verifyRewardedAd({
  userId,
  prisma,
  key_id,
  signature,
}: {
  userId: string;
  prisma: PrismaClient;
  key_id: string;
  signature: string;
}) {
  /*
  const keys = await axios.get(
    "https://gstatic.com/admob/reward/verifier-keys.json",
  );

  console.log(keys.data.keys[0]);

  const key = keys.data.keys.find(
    (key: { keyId: string }) => Number(key.keyId) === Number(key_id),
  );

  if (!key) {
    throw new Error("Key not found");
  }

  const verifier = crypto.createVerify("RSA-SHA256");

  verifier.update(userId);

  const verified = verifier.verify(
    key.pem,
    signature,
    "base64",
  );

  if (!verified) {
    throw new Error("Not verified");
  }
  */

  await prisma.extraSwipe.create({
    data: {
      userId,
      count: 40,
    },
  });
}
