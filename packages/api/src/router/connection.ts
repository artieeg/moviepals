import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const connection = createTRPCRouter({
  listConnections: protectedProcedure.query(async ({ ctx }) => {
    const [first, second] = await ctx.appDb
      .transaction()
      .execute(async (trx) => {
        const first = await trx
          .selectFrom("Friend")
          .innerJoin("User", "secondUserId", "User.id")
          .where("firstUserId", "=", ctx.user)
          .select(["User.id", "User.name", "User.username", "User.emoji"])
          .execute();

        const second = await trx
          .selectFrom("Friend")
          .innerJoin("User", "firstUserId", "User.id")
          .select(["User.id", "User.name", "User.username", "User.emoji"])
          .where("secondUserId", "=", ctx.user)
          .execute();

        return [first, second];
      });

    const connections = [...first, ...second];

    return { connections };
  }),

  deleteConnection: protectedProcedure
    .input(
      z.object({
        connectionId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input: { connectionId } }) => {
      await ctx.appDb
        .deleteFrom("Friend")
        .where("id", "=", connectionId)
        .execute();
    }),
});
