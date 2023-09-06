import { createId } from "@paralleldrive/cuid2";
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
      const slug = inviteUrl.split("/").pop();

      if (!slug) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      const inviteLink = await ctx.appDb
        .selectFrom("UserInviteLink")
        .innerJoin("User as U", "UserInviteLink.slug", "U.userInviteSlugId")
        .where((eb) =>
          eb.and([eb("slug", "=", slug), eb("U.id", "is not", null)]),
        )
        .select(["U.id as inviterId", "U.name as inviterName", "slug"])
        .executeTakeFirstOrThrow(() => new TRPCError({ code: "NOT_FOUND" }));

      if (!inviteLink.inviterId || !inviteLink.inviterName) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      await ctx.appDb
        .insertInto("Friend")
        .values({
          id: createId(),
          firstUserId: inviteLink.inviterId,
          secondUserId: ctx.user,
        })
        .execute();

      return { inviter: { name: inviteLink.inviterName } };
    }),

  fetchInviteUrl: protectedProcedure.query(async ({ ctx }) => {
    const { slug } = await ctx.appDb
      .selectFrom("User")
      .where("id", "=", ctx.user)
      .select("userInviteSlugId as slug")
      .executeTakeFirstOrThrow(() => new TRPCError({ code: "NOT_FOUND" }));

    const link = "https://moviepals.io/" + slug;

    return { link };
  }),
});
