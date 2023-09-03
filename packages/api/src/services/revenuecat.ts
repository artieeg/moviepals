import { createId } from "@paralleldrive/cuid2";
import { TRPCError } from "@trpc/server";
import * as jwt from "jsonwebtoken";

import { appDb } from "@moviepals/db";

import { env } from "../utils/env";

export async function handleFullAccessPurchase({
  user,
  header,
}: {
  user: string;
  header: string;
}) {
  //jwt.verify(header, env.REVENUE_CAT_SECRET);

  appDb.transaction().execute(async (trx) => {
    const { id } = await trx
      .insertInto("FullAccessPurchase")
      .values({
        id: createId(),
        source: "revenuecat",
      })
      .returning("id")
      .executeTakeFirstOrThrow(
        () => new TRPCError({ code: "INTERNAL_SERVER_ERROR" }),
      );

    await trx
      .updateTable("User")
      .set({
        fullAccessPurchaseId: id,
      })
      .where((eb) => eb("id", "=", user))
      .execute();
  });
}
