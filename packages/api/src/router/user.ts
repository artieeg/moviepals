import { createHash, randomBytes } from "crypto";
import { createId } from "@paralleldrive/cuid2";
import { TRPCError } from "@trpc/server";
import appleSignInAuth from "apple-signin-auth";
import { OAuth2Client } from "google-auth-library";
import { DateTime } from "luxon";
import { z } from "zod";

import { logger } from "../logger";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { env } from "../utils/env";
import { createToken } from "../utils/jwt";

const signInMethodSchema = z.discriminatedUnion("provider", [
  z.object({ provider: z.literal("google"), idToken: z.string() }),
  z.object({
    provider: z.literal("apple"),
    idToken: z.string(),
    nonce: z.string(),
  }),
]);

export const user = createTRPCRouter({
  updateUser: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        username: z.string().max(32),
        emoji: z.string(),
      }),
    )
    .mutation(async ({ input: { name, username, emoji }, ctx }) => {
      const existingUser = await ctx.appDb
        .selectFrom("User")
        .where((eb) =>
          eb.and([eb("username", "=", username), eb("id", "!=", ctx.user)]),
        )
        .executeTakeFirst();

      if (existingUser) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Username already taken",
        });
      }

      const user = await ctx.appDb
        .updateTable("User")
        .set({
          name,
          username,
          emoji,
        })
        .where("id", "=", ctx.user)
        .returningAll()
        .executeTakeFirstOrThrow(() => new TRPCError({ code: "NOT_FOUND" }));

      return user;
    }),

  deleteMyAccount: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.appDb
      .deleteFrom("ConnectionRequest")
      .where((eb) =>
        eb.or([
          eb("firstUserId", "=", ctx.user),
          eb("secondUserId", "=", ctx.user),
        ]),
      )
      .execute();

    await ctx.appDb
      .deleteFrom("Friend")
      .where((eb) =>
        eb.or([
          eb("firstUserId", "=", ctx.user),
          eb("secondUserId", "=", ctx.user),
        ]),
      )
      .execute();

    const delUserPromise = ctx.appDb
      .deleteFrom("User")
      .where("id", "=", ctx.user)
      .execute();

    const delSwipesPromise = ctx.dbMovieSwipe.swipes.deleteMany({
      userId: ctx.user,
    });

    const delReviewStatePromise = ctx.dbMovieSwipe.reviewState.deleteMany({
      userId: ctx.user,
    });

    await Promise.all([
      delUserPromise,
      delSwipesPromise,
      delReviewStatePromise,
    ]);
  }),

  /**
   * Returns the data of the currently logged in user
   * */
  getMyData: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.appDb
      .selectFrom("User")
      .where("id", "=", ctx.user)
      .selectAll()
      .executeTakeFirstOrThrow(() => new TRPCError({ code: "NOT_FOUND" }));

    return user;
  }),

  getUserData: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
      }),
    )
    .query(async ({ ctx, input: { userId } }) => {
      const [user, myLikes, userLikes] = await Promise.all([
        ctx.appDb
          .selectFrom("User")
          .where("id", "=", userId)
          .selectAll()
          .executeTakeFirstOrThrow(() => new TRPCError({ code: "NOT_FOUND" })),

        ctx.dbMovieSwipe.swipes
          .find(
            {
              userId: ctx.user,
              liked: true,
            },
            { projection: { movieId: 1 } },
          )
          .toArray(),

        ctx.dbMovieSwipe.swipes
          .find(
            {
              userId: userId,
              liked: true,
            },
            { projection: { movieId: 1 } },
          )
          .toArray(),
      ]);

      let matchesCount = 0;

      for (const myLike of myLikes) {
        for (const userLike of userLikes) {
          if (myLike.movieId === userLike.movieId) {
            matchesCount++;
          }
        }
      }

      return { user, matchesCount };
    }),

  signIn: publicProcedure
    .input(z.object({ method: signInMethodSchema }))
    .query(async ({ input: { method }, ctx }) => {
      const { sub } =
        method.provider === "google"
          ? await getEmailFromGoogleToken(method.idToken)
          : await getEmailFromAppleToken({
              idToken: method.idToken,
              nonce: method.nonce,
            });

      const existingUser = await ctx.appDb
        .selectFrom("User")
        .where("sub", "=", sub)
        .selectAll()
        .executeTakeFirst();

      if (existingUser) {
        const token = createToken({ user: existingUser.id });

        return { token, user: existingUser };
      } else {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
    }),

  isPaid: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.appDb
      .selectFrom("User")
      .where("id", "=", ctx.user)
      .selectAll()
      .executeTakeFirstOrThrow(() => new TRPCError({ code: "NOT_FOUND" }));

    let isPaid = false;

    if (user.fullAccessPurchaseId) {
      isPaid = true;
    } else {
      const sharedPremium = await ctx.appDb
        .selectFrom("SharedPremium")
        .where("userId", "=", ctx.user)
        .select("id")
        .executeTakeFirst();

      isPaid = !!sharedPremium;
    }

    return { isPaid };
  }),

  allowPushNotifications: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.appDb
      .updateTable("User")
      .set({ allowPushNotifications: true })
      .where("id", "=", ctx.user)
      .execute();
  }),

  joinMailingList: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.appDb
      .updateTable("User")
      .set({ joinedMailingList: true })
      .where("id", "=", ctx.user)
      .execute();
  }),

  setTimezoneOffset: protectedProcedure
    .input(z.object({ timezone: z.string() }))
    .mutation(async ({ input: { timezone }, ctx }) => {
      const timezoneOffset = DateTime.now().setZone(timezone).offset / 60;

      await ctx.appDb
        .updateTable("User")
        .set({ timezoneOffset })
        .where("id", "=", ctx.user)
        .execute();
    }),

  createNewAccount: publicProcedure
    .input(
      z.object({
        username: z.string().max(32),
        name: z.string(),
        emoji: z.string(),
        method: signInMethodSchema,
      }),
    )
    .mutation(async ({ input: { name, username, emoji, method }, ctx }) => {
      const isAppleReview = name.toLowerCase().trim() === "apple";

      const existingUser = await ctx.appDb
        .selectFrom("User")
        .where("username", "=", username)
        .selectAll()
        .executeTakeFirst();

      //Throw is username is taken
      if (existingUser) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Username already taken",
        });
      }

      const { email, sub } =
        method.provider === "google"
          ? await getEmailFromGoogleToken(method.idToken)
          : await getEmailFromAppleToken({
              idToken: method.idToken,
              nonce: method.nonce,
            });

      if (!email) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Email not found",
        });
      }

      let inviteLinkSlug: string | null = null;

      while (!inviteLinkSlug) {
        try {
          const id = randomBytes(4).toString("hex");

          await ctx.appDb
            .insertInto("UserInviteLink")
            .values({
              slug: id,
            })
            .execute();

          inviteLinkSlug = id;
        } catch (e) {
          logger.error(e);
        }
      }

      const newUser = await ctx.appDb.transaction().execute(async (trx) => {
        let fullAccessPurchaseId: string | null = null;

        if (!isAppleReview) {
          const fullAccessPurchase = await trx
            .insertInto("FullAccessPurchase")
            .values({
              id: createId(),
              source: "gift",
            })
            .returning("id")
            .executeTakeFirstOrThrow(
              () => new TRPCError({ code: "INTERNAL_SERVER_ERROR" }),
            );

          fullAccessPurchaseId = fullAccessPurchase.id;
        }

        return await trx
          .insertInto("User")
          .values({
            id: createId(),
            name,
            email,
            emoji,
            sub,
            username,
            timezoneOffset: 0,
            fcmToken: null,
            userInviteSlugId: inviteLinkSlug as string,
            fullAccessPurchaseId,
          })
          .returningAll()
          .executeTakeFirstOrThrow(
            () => new TRPCError({ code: "INTERNAL_SERVER_ERROR" }),
          );
      });

      const token = createToken({ user: newUser.id });

      return { token, user: newUser };
    }),

  /**
   * Searches a user by name or username
   *
   * If two users have already connected, they won't appear in each other's search results
   * */
  search: protectedProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ input: { query }, ctx }) => {
      const users = await ctx.appDb
        .selectFrom("User")
        .leftJoin(
          "ConnectionRequest",
          "User.id",
          "ConnectionRequest.secondUserId",
        )
        .leftJoin("Friend as F1", "User.id", "F1.secondUserId")
        .leftJoin("Friend as F2", "User.id", "F2.firstUserId")
        .where((e) =>
          e.and([
            e.or([
              e("F1.firstUserId", "is", null),
              e("F2.secondUserId", "is", null),
            ]),

            e("username", "ilike", `${query}%`),
            e("User.id", "!=", ctx.user),
          ]),
        )
        .select([
          "User.id",
          "username",
          "emoji",
          "name",
          "ConnectionRequest.id as connectionRequestId",
        ])
        .execute();

      return users.map((user) => ({
        ...user,

        requested: user.connectionRequestId !== null,
      }));
    }),
});

async function getEmailFromAppleToken({
  idToken,
  nonce,
}: {
  idToken: string;
  nonce: string;
}) {
  const { email, sub } = await appleSignInAuth.verifyIdToken(idToken, {
    nonce: nonce ? createHash("sha256").update(nonce).digest("hex") : undefined,
  });

  return { email, sub };
}

async function getEmailFromGoogleToken(googleIdToken: string) {
  const client = new OAuth2Client();

  const ticket = await client.verifyIdToken({
    audience: env.GOOGLE_CLIENT_ID,
    idToken: googleIdToken,
  });

  const payload = ticket.getPayload();

  const email = payload?.email;
  const sub = payload?.sub;

  if (!sub) {
    throw new TRPCError({ code: "BAD_REQUEST" });
  }

  return { email, sub };
}
