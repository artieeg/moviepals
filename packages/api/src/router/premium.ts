import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const premium = createTRPCRouter({
  /** Returns an array of users the user has shared premium with */
  getSharedList: protectedProcedure.query(async ({ ctx }) => {
    const { fullAccessPurchaseId } = await ctx.appDb
      .selectFrom("User")
      .where((eb) =>
        eb.and([
          eb("id", "=", ctx.user),
          eb("fullAccessPurchaseId", "is not", null),
        ]),
      )
      .select("fullAccessPurchaseId")
      .executeTakeFirstOrThrow(() => new TRPCError({ code: "NOT_FOUND" }));

    const sharedList = await ctx.appDb
      .selectFrom("SharedPremium")
      .where("purchaseId", "=", fullAccessPurchaseId)
      .innerJoin("User", "userId", "User.id")
      .select(["User.id", "User.name", "User.username", "User.emoji"])
      .execute();

    return sharedList;
  }),

  /** Allows the user to share their premium */
  share: protectedProcedure
    .input(
      z.object({
        userIds: z.array(z.string()).max(4),
      }),
    )
    .mutation(async ({ ctx, input: { userIds } }) => {
      const { fullAccessPurchaseId } = await ctx.appDb
        .selectFrom("User")
        .where("id", "=", ctx.user)
        .select("fullAccessPurchaseId")
        .executeTakeFirstOrThrow(() => new TRPCError({ code: "NOT_FOUND" }));

      if (!fullAccessPurchaseId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You don't have premium",
        });
      }

      const { count } = await ctx.appDb
        .selectFrom("SharedPremium")
        .where("purchaseId", "=", fullAccessPurchaseId)
        .select((eb) => eb.fn.countAll().as("count"))
        .executeTakeFirstOrThrow(() => new TRPCError({ code: "NOT_FOUND" }));

      if (Number(count) >= 4) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You can only share with 4 people",
        });
      }

      await ctx.appDb.transaction().execute(async (trx) => {
        for (const id of userIds) {
          await trx
            .insertInto("SharedPremium")
            .values({
              id: id,
              purchaseId: fullAccessPurchaseId,
              userId: id,
            })
            .execute();
        }
      });
    }),
});
