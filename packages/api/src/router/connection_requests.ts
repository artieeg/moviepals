import { createId } from "@paralleldrive/cuid2";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { sendNotification } from "../services";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const connection_requests = createTRPCRouter({
  postConnectionRequest: protectedProcedure
    .input(z.object({ user: z.string() }))
    .mutation(async ({ ctx, input: { user } }) => {
      const { fcmToken, allowPushNotifications, requesterName } = await ctx.appDb
        .transaction()
        .execute(async (trx) => {
          const { fcmToken, allowPushNotifications } = await trx
            .selectFrom("User")
            .where("id", "=", user)
            .select(["fcmToken", "allowPushNotifications"])
            .executeTakeFirstOrThrow(
              () => new TRPCError({ code: "NOT_FOUND" }),
            );

          const { name: requesterName } = await trx
            .selectFrom("User")
            .where("id", "=", ctx.user)
            .select(["name"])
            .executeTakeFirstOrThrow(
              () => new TRPCError({ code: "NOT_FOUND" }),
            );

          return { fcmToken, allowPushNotifications, requesterName };
        });

      const request = await ctx.appDb
        .insertInto("ConnectionRequest")
        .values({
          id: createId(),
          firstUserId: ctx.user,
          secondUserId: user,
          rejected: false,
        })
        .returningAll()
        .execute();

      if (allowPushNotifications && fcmToken) {
        sendNotification({
          token: fcmToken,
          title: "New Connection Request 🍿",
          body: `${requesterName} wants to connect with you!`,
          link: "moviepals://friends",
        });
      }

      return { request };
    }),

  deleteConnectionRequest: protectedProcedure
    .input(z.object({ user: z.string() }))
    .mutation(async ({ ctx, input: { user } }) => {
      await ctx.appDb
        .deleteFrom("ConnectionRequest")
        .where((eb) =>
          eb.or([
            eb.and([
              eb("firstUserId", "=", ctx.user),
              eb("secondUserId", "=", user),
            ]),
            eb.and([
              eb("firstUserId", "=", user),
              eb("secondUserId", "=", ctx.user),
            ]),
          ]),
        )
        .execute();
    }),

  listConnectionRequests: protectedProcedure.query(async ({ ctx }) => {
    const requests = await ctx.appDb
      .selectFrom("ConnectionRequest")
      .where((eb) =>
        eb.and([eb("secondUserId", "=", ctx.user), eb("rejected", "=", false)]),
      )
      .innerJoin("User", "User.id", "ConnectionRequest.firstUserId")
      .select([
        "ConnectionRequest.id as connectionRequestId",
        "User.id",
        "User.username",
        "User.name",
        "User.emoji",
      ])
      .execute();

    return { requests };
  }),

  countConnectionRequests: protectedProcedure.query(async ({ ctx }) => {
    const { count } = await ctx.appDb
      .selectFrom("ConnectionRequest")
      .where((eb) =>
        eb.and([eb("secondUserId", "=", ctx.user), eb("rejected", "=", false)]),
      )
      .select((b) => b.fn.countAll().as("count"))
      .executeTakeFirstOrThrow(
        () => new TRPCError({ code: "INTERNAL_SERVER_ERROR" }),
      );

    return { count: Number(count) };
  }),

  rejectConnectionRequest: protectedProcedure
    .input(z.object({ user: z.string() }))
    .mutation(async ({ ctx, input: { user } }) => {
      await ctx.appDb
        .updateTable("ConnectionRequest")
        .set({
          rejected: true,
        })
        .where((eb) =>
          eb.or([
            eb.and([
              eb("firstUserId", "=", ctx.user),
              eb("secondUserId", "=", user),
            ]),
            eb.and([
              eb("firstUserId", "=", user),
              eb("secondUserId", "=", ctx.user),
            ]),
          ]),
        )
        .execute();
    }),

  acceptConnectionRequest: protectedProcedure
    .input(
      z.object({
        connectionRequestId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input: { connectionRequestId } }) => {
      const connectionRequest = await ctx.appDb
        .selectFrom("ConnectionRequest")
        .where("id", "=", connectionRequestId)
        .select(["firstUserId", "secondUserId"])
        .executeTakeFirstOrThrow(() => new TRPCError({ code: "NOT_FOUND" }));

      const friendship = await ctx.appDb.transaction().execute(async (trx) => {
        await trx
          .deleteFrom("ConnectionRequest")
          .where("id", "=", connectionRequestId)
          .execute();

        return await trx
          .insertInto("Friend")
          .values({
            id: createId(),
            firstUserId: connectionRequest.firstUserId,
            secondUserId: connectionRequest.secondUserId,
          })
          .returningAll()
          .execute();
      });

      return { friendship };
    }),
});
