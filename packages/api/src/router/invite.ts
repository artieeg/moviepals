import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const invite = createTRPCRouter({
  applyInvite: protectedProcedure
    .input(
      z.object({
        inviteUrl: z.string(),
      }),
    )
    .mutation(async ({ ctx, input: { inviteUrl } }) => {
      const inviteLink = await ctx.prisma.userInviteLink.findUnique({
        where: { slug: inviteUrl },
      });

      const inviter = await ctx.prisma.user.findUnique({
        where: { userInviteLinkId: inviteLink?.id },
      });

      if (!inviter) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      await ctx.prisma.connection.create({
        data: {
          firstUserId: inviter.id,
          secondUserId: ctx.user,
        },
      });

      return {inviter};
    }),

  fetchInviteUrl: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { id: ctx.user },
      include: {
        userInviteLink: true,
      },
    });

    if (!user) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    const link = "https://moviepals.io/" + user.userInviteLink.slug;

    return { link };
  }),
});
