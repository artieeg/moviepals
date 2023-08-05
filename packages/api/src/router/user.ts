import crypto from "crypto";
import { TRPCUntypedClient } from "@trpc/client";
import { TRPCError } from "@trpc/server";
import appleSignInAuth from "apple-signin-auth";
import { OAuth2Client } from "google-auth-library";
import { z } from "zod";

import { getCountryFromIP } from "../services";
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
  getUserData: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { id: ctx.user },
    });

    if (!user) {
      throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
    }

    return user;
  }),

  findExistingUser: publicProcedure
    .input(z.object({ method: signInMethodSchema }))
    .query(async ({ input: { method }, ctx }) => {
      const email =
        method.provider === "google"
          ? await getEmailFromGoogleToken(method.idToken)
          : await getEmailFromAppleToken({
              idToken: method.idToken,
              nonce: method.nonce,
            });

      const existingUser = await ctx.prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        const token = createToken({ user: existingUser.id });

        return { token, user: existingUser };
      } else {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
    }),

  createNewAccount: publicProcedure
    .input(
      z.object({
        username: z.string(),
        name: z.string(),
        method: signInMethodSchema,
      }),
    )
    .mutation(async ({ input, ctx }) => {
      let country = "US";

      try {
        country = await getCountryFromIP(ctx.ip);
      } catch {}

      const { name, username, method } = input;

      const email =
        method.provider === "google"
          ? await getEmailFromGoogleToken(method.idToken)
          : await getEmailFromAppleToken({
              idToken: method.idToken,
              nonce: method.nonce,
            });

      const user = await ctx.prisma.user.create({
        data: {
          country,
          name,
          username,
          email,
        },
      });

      const token = createToken({ user: user.id });

      return { token, user };
    }),
});

async function getEmailFromAppleToken({
  idToken,
  nonce,
}: {
  idToken: string;
  nonce: string;
}) {
  const { email } = await appleSignInAuth.verifyIdToken(idToken, {
    nonce: nonce
      ? crypto.createHash("sha256").update(nonce).digest("hex")
      : undefined,
  });

  return email;
}

async function getEmailFromGoogleToken(googleIdToken: string) {
  const client = new OAuth2Client();

  const ticket = await client.verifyIdToken({
    audience: env.GOOGLE_CLIENT_ID,
    idToken: googleIdToken,
  });

  const payload = ticket.getPayload();

  const email = payload?.email;

  if (!email) {
    throw new TRPCError({ code: "BAD_REQUEST" });
  }

  return email;
}
