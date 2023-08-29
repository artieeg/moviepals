import { createVerify } from "crypto";
import URL from "url";
import { encode, stringify } from "querystring";
import axios from "axios";
import { z } from "zod";
import Verifier from "@exoshtw/admob-ssv";

import { UserFeedDeliveryCache } from "./user-feed-delivery-cache";

export const admobSchema = z
  .object({
    user_id: z.string(),
    ad_unit: z.string(),
    key_id: z.string(),
    signature: z.string(),
  })
  .passthrough();

export async function verifyRewardedAdCallback({
  url,
  userFeedDeliveryCache,
}: {
  url: string,
  userFeedDeliveryCache: UserFeedDeliveryCache;
}) {
  const verifier = new Verifier();

  const parts = URL.parse(url, true);
  const isValid = await verifier.verify(parts.query);

  //const payload = admobSchema.parse(data);



  //await verifySignature(payload);

  await userFeedDeliveryCache.incAdWatched(payload.user_id);
}

async function verifySignature(payload: z.infer<typeof admobSchema>) {
  const keys = await axios.get(
    "https://gstatic.com/admob/reward/verifier-keys.json",
  );

  const { key_id, signature, ...rest } = payload;

  const key = keys.data.keys.find(
    (key: { keyId: string }) => Number(key.keyId) === Number(key_id),
  );

  console.log(keys.data);

  if (!key) {
    throw new Error("Key not found");
  }

  console.log(key);

  const verifier = createVerify("RSA-SHA256");

  console.log("verifier created");
  verifier.update(
    encode(
      {
        ad_network: "5450213213286189855",
        ad_unit: "2620773067",
        custom_data: "ca-app-pub-1972828603941935/2620773067",
        //key_id: "3335741209",
        //msg: "admob callback",
        reward_amount: "40",
        reward_item: "swipes",
        //signature: "MEQCIDKDIvVLDf7TBhIGaCXHel0oJB3D5ij5wUaYI-FQSK8dAiAgZbghNtdOGwLL6_699XejESz7d57Ww3NAliGzdQRAdQ",
        timestamp: "1693290466180",
        transaction_id: "00060409e7b3d17208bbe2752b0550b9",
        user_id: "zeghqztdmjfsz6bja1l3ug0f",
      } as any,

      /*
      {
      ad_network: rest.ad_network,
      ad_unit: rest.ad_unit,
      reward_amount: rest.reward_amount,
      reward_item: rest.reward_item,
      timestamp: rest.timestamp,
      transaction_id: rest.transaction_id,
      user_id: rest.user_id,
    } as any

       * */
    ),
  );

  const verified = verifier.verify(key.pem, Buffer.from(signature, "base64"));

  console.log({ verified });

  if (!verified) {
    throw new Error("Not verified");
  }

  return true;
}
