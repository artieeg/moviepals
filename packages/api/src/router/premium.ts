import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const premium = createTRPCRouter({
  /** Returns an array of users the user has shared premium with */
  getSharedList: protectedProcedure.query(async ({ ctx }) => {
    const userPremium = await ctx.prisma.user.findUnique({
      where: {
        id: ctx.user,
      },
      include: {
        fullAccessPurchase: true,
      },
    });

    if (!userPremium) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    const sharedList = await ctx.prisma.sharedPremium.findMany({
      where: {
        purchaseId: userPremium.fullAccessPurchase?.id,
      },
      include: {
        User: true,
      },
    });

    return sharedList.map((user) => user.User).filter(Boolean);
  }),

  /** Allows the user to share their premium */
  share: protectedProcedure
    .input(
      z.object({
        userIds: z.array(z.string()).max(4),
      }),
    )
    .mutation(async ({ ctx, input: { userIds } }) => {
      const fullPurchase = await ctx.prisma.user.findUnique({
        where: {
          id: ctx.user,
        },
        include: {
          fullAccessPurchase: true,
        },
      });

      if (!fullPurchase) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      await ctx.prisma.$transaction(
        userIds.map((sharedWithId) => {
          return ctx.prisma.sharedPremium.create({
            data: {
              purchase: {
                connect: {
                  id: fullPurchase.id,
                },
              },
              User: {
                connect: {
                  id: sharedWithId,
                },
              },
            },
          });
        }),
      );
    }),
});
