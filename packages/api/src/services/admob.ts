import { createVerify } from "crypto";
import { encode } from "querystring";
import axios from "axios";
import { z } from "zod";

import { logger } from "../logger";
import { WatchedAdCountCache } from "./watched-ads-count-cache";

export const admobSchema = z
  .object({
    user_id: z.string(),
    ad_unit: z.string(),
    key_id: z.string(),
    signature: z.string(),
  })
  .passthrough();

export async function verifyRewardedAdCallback({
  data,
  watchedAdCountCache,
}: {
  data: unknown;
  watchedAdCountCache: WatchedAdCountCache;
}) {
  const payload = admobSchema.parse(data);

  await verifySignature(payload);

  await watchedAdCountCache.incWatchedAdsCount(payload.user_id);
}

async function verifySignature(payload: z.infer<typeof admobSchema>) {
  const keys = await axios.get(
    "https://gstatic.com/admob/reward/verifier-keys.json",
  );

  const { key_id, signature, ...rest } = payload;

  const key = keys.data.keys.find(
    (key: { keyId: string }) => Number(key.keyId) === Number(key_id),
  );

  if (!key) {
    throw new Error("Key not found");
  }

  const verifier = createVerify("RSA-SHA256");

  verifier.update(
    encode({
      ad_network: rest.ad_network,
      ad_unit: rest.ad_unit,
      reward_amount: rest.reward_amount,
      reward_item: rest.reward_item,
      timestamp: rest.timestamp,
      transaction_id: rest.transaction_id,
      user_id: rest.user_id,
    } as any),
  );

  const verified = verifier.verify(key.pem, Buffer.from(signature, "base64"));

  if (!verified) {
    throw new Error("Not verified");
  }

  return true;
}
