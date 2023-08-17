import crypto from "crypto";
import qs from "querystring";
import axios from "axios";
import { z } from "zod";

import { UserFeedDeliveryCache } from "./user-feed-delivery-cache";

export const admobSchema = z.object({
  user_id: z.string(),
  ad_unit: z.string(),
  key_id: z.string(),
  signature: z.string(),
});

export async function verifyRewardedAdCallback({
  data,
  userFeedDeliveryCache,
}: {
  data: unknown;
  userFeedDeliveryCache: UserFeedDeliveryCache;
}) {
  const payload = admobSchema.parse(data);

  await verifySignature(payload);

  await userFeedDeliveryCache.incAdWatched(payload.user_id);
}

async function verifySignature(payload: z.infer<typeof admobSchema>) {
  const keys = await axios.get(
    "https://gstatic.com/admob/reward/verifier-keys.json",
  );

  console.log(keys.data.keys[0]);

  const { key_id, signature, ...rest } = payload;

  const key = keys.data.keys.find(
    (key: { keyId: string }) => Number(key.keyId) === Number(key_id),
  );

  if (!key) {
    throw new Error("Key not found");
  }

  const verifier = crypto.createVerify("RSA-SHA256");

  verifier.update(qs.encode(rest));

  const verified = verifier.verify(key.pem, signature, "base64");

  if (!verified) {
    throw new Error("Not verified");
  }

  return true;
}
