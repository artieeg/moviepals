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
  setFCMToken: protectedProcedure
    .input(
      z.object({
        fcmToken: z.string(),
      }),
    )
    .mutation(async ({ input: { fcmToken }, ctx }) => {
      await ctx.appDb
        .updateTable("User")
        .set({ fcmToken })
        .where("id", "=", ctx.user)
        .execute();
    }),

  updateUser: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        username: z.string().max(32),
        emoji: z.string(),
        fcmToken: z.string().optional(),
      }),
    )
    .mutation(async ({ input: { name, fcmToken, username, emoji }, ctx }) => {
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
          fcmToken,
        })
        .where("id", "=", ctx.user)
        .returningAll()
        .executeTakeFirstOrThrow(() => new TRPCError({ code: "NOT_FOUND" }));

      return user;
    }),

  deleteMyAccount: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.appDb
      .deleteFrom("UnlockedCategory")
      .where("userId", "=", ctx.user)
      .execute();

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

    let isPaid: "paid" | "shared" | false = false;

    if (user.fullAccessPurchaseId) {
      isPaid = "paid";
    } else {
      const sharedPremium = await ctx.appDb
        .selectFrom("SharedPremium")
        .where("userId", "=", ctx.user)
        .select("id")
        .executeTakeFirst();

      if (sharedPremium) {
        isPaid = "shared";
      }
    }

    return { isPaid };
  }),

  togglePushNotifications: protectedProcedure
    .input(
      z.object({
        allowPushNotifications: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input: { allowPushNotifications } }) => {
      await ctx.appDb
        .updateTable("User")
        .set({ allowPushNotifications })
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
        _dev: z.boolean().optional().default(false),
      }),
    )
    .mutation(
      async ({
        input: { name, _dev, username: _username, emoji, method },
        ctx,
      }) => {
        //Handle the dumb Google review bot
        const username =
          _username === "text" ? `text${Math.random()}` : _username;

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

        let attempts = 10;
        while (!inviteLinkSlug && attempts-- > 0) {
          try {
            const id = randomBytes(4).toString("hex");

            await ctx.appDb
              .insertInto("UserInviteLink")
              .values({
                slug: id,
              })
              .returning("slug")
              .execute();

            inviteLinkSlug = id;

            break;
          } catch (e) {
            logger.error(e);
          }
        }

        if (attempts <= 0) {
          inviteLinkSlug = generateRandomString(8);
        }

        const newUser = await ctx.appDb.transaction().execute(async (trx) => {
          let fullAccessPurchaseId: string | null = null;

          /*
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
            * */

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
      },
    ),

  /**
   * Searches a user by name or username
   *
   * If two users have already connected, they won't appear in each other's search results
   * */
  search: protectedProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ input: { query: _query }, ctx }) => {
      //remove "@" from the query
      const query = _query.replaceAll("@", "");

      const connections = await ctx.appDb
        .selectFrom("Friend")
        .where((eb) =>
          eb.or([
            eb("firstUserId", "=", ctx.user),
            eb("secondUserId", "=", ctx.user),
          ]),
        )
        .select(["firstUserId", "secondUserId"])
        .execute();

      const filteredIds = connections
        .map((connection) =>
          connection.firstUserId === ctx.user
            ? connection.secondUserId
            : connection.firstUserId,
        )
        .filter(Boolean);

      filteredIds.push(ctx.user);

      const users = await ctx.appDb
        .selectFrom("User")
        .leftJoin(
          "ConnectionRequest",
          "User.id",
          "ConnectionRequest.secondUserId",
        )
        .where((e) =>
          e.and([
            e("username", "ilike", `${query}%`),
            e("User.id", "not in", filteredIds),
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

function generateRandomString(length: number) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const charactersLength = characters.length;

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charactersLength);
    result += characters.charAt(randomIndex);
  }

  return result;
}
