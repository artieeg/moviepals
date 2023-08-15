import { TRPCError } from "@trpc/server";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const invite = createTRPCRouter({
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
