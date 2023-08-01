import crypto from "crypto";
import { TRPCError } from "@trpc/server";
import appleSignInAuth from "apple-signin-auth";
import { OAuth2Client } from "google-auth-library";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc";
import { env } from "../utils/env";
import { createToken } from "../utils/jwt";

export const user = createTRPCRouter({
  createNewAccount: publicProcedure
    .input(
      z.object({
        username: z.string(),
        name: z.string(),
        method: z.discriminatedUnion("provider", [
          z.object({ provider: z.literal("google"), idToken: z.string() }),
          z.object({
            provider: z.literal("apple"),
            idToken: z.string(),
            nonce: z.string(),
          }),
        ]),
      }),
    )
    .mutation(async ({ input, ctx }) => {
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
