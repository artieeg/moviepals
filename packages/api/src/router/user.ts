import { createHash, randomBytes } from "crypto";
import { TRPCError } from "@trpc/server";
import appleSignInAuth from "apple-signin-auth";
import { OAuth2Client } from "google-auth-library";
import { DateTime } from "luxon";
import { z } from "zod";

import { UserInviteLink } from "@moviepals/db";

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
  deleteMyAccount: protectedProcedure.mutation(async ({ ctx }) => {
    const delUserPromise = ctx.prisma.user.delete({
      where: { id: ctx.user },
    });

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
    const user = await ctx.prisma.user.findUnique({
      where: { id: ctx.user },
    });

    if (!user) {
      throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
    }

    return user;
  }),

  getUserData: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
      }),
    )
    .query(async ({ ctx, input: { userId } }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const matchesCount = await ctx.dbMovieSwipe.swipes.countDocuments({
        userId: { $in: [user.id, ctx.user] },
        liked: true,
      });

      return { user, matchesCount };
    }),

  findExistingUser: publicProcedure
    .input(z.object({ method: signInMethodSchema }))
    .query(async ({ input: { method }, ctx }) => {
      const { sub } =
        method.provider === "google"
          ? await getEmailFromGoogleToken(method.idToken)
          : await getEmailFromAppleToken({
              idToken: method.idToken,
              nonce: method.nonce,
            });

      const existingUser = await ctx.prisma.user.findUnique({
        where: { sub },
      });

      if (existingUser) {
        const token = createToken({ user: existingUser.id });

        return { token, user: existingUser };
      } else {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
    }),

  isPaid: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { id: ctx.user },
    });

    if (!user) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    let isPaid = false;

    if (user.fullAccessPurchaseId) {
      isPaid = true;
    } else {
      const sharedPremium = await ctx.prisma.sharedPremium.findUnique({
        where: { userId: ctx.user },
      });

      isPaid = !!sharedPremium;
    }

    return { isPaid };
  }),

  allowPushNotifications: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.prisma.user.update({
      where: { id: ctx.user },
      data: { allowPushNotifications: true },
    });
  }),

  joinMailingList: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.prisma.user.update({
      where: { id: ctx.user },
      data: { joinedMailingList: true },
    });
  }),

  setTimezoneOffset: protectedProcedure
    .input(z.object({ timezone: z.string() }))
    .mutation(async ({ input: { timezone }, ctx }) => {
      const timezoneOffset = DateTime.now().setZone(timezone).offset / 60;

      await ctx.prisma.user.update({
        where: { id: ctx.user },
        data: { timezoneOffset },
      });
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
      //Check if username is available
      const existingUser = await ctx.prisma.user.findUnique({
        where: { username },
      });

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

      let inviteLink: UserInviteLink | undefined = undefined;

      while (!inviteLink) {
        try {
          inviteLink = await ctx.prisma.userInviteLink.create({
            data: {
              slug: randomBytes(4).toString("hex"),
            },
          });
        } catch {}
      }

      const user = await ctx.prisma.user.create({
        data: {
          sub,
          name,
          username,
          emoji,
          email,
          userInviteLinkId: inviteLink.id,
        },
      });

      const token = createToken({ user: user.id });

      return { token, user };
    }),

  /**
   * Searches a user by name or username
   *
   * If two users have already connected, they won't appear in each other's search results
   * */
  search: protectedProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ input: { query }, ctx }) => {
      const [alreadyConnected, connectionRequests] =
        await ctx.prisma.$transaction([
          ctx.prisma.connection.findMany({
            where: {
              OR: [
                {
                  firstUserId: ctx.user,
                },
                {
                  secondUserId: ctx.user,
                },
              ],
            },
          }),
          ctx.prisma.connectionRequest.findMany({
            where: {
              OR: [
                {
                  firstUserId: ctx.user,
                },
                {
                  secondUserId: ctx.user,
                },
              ],
            },
          }),
        ]);

      const alreadyConnectedUserIds = alreadyConnected.map((connection) =>
        connection.firstUserId === ctx.user
          ? connection.secondUserId
          : connection.firstUserId,
      );

      const users = await ctx.prisma.user.findMany({
        where: {
          id: {
            notIn: alreadyConnectedUserIds,
          },
          OR: [
            {
              name: {
                contains: query,
                mode: "insensitive",
              },
            },
            {
              username: {
                contains: query,
                mode: "insensitive",
              },
            },
          ],
        },
        select: {
          id: true,
          username: true,
          name: true,
          emoji: true,
        },
        take: 50,
      });

      return users.map((user) => ({
        ...user,

        requested: connectionRequests.some(
          (connectionRequest) =>
            connectionRequest.firstUserId === user.id ||
            connectionRequest.secondUserId === user.id,
        ),
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
