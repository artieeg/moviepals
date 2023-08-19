import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const connection = createTRPCRouter({
  listConnections: protectedProcedure.query(async ({ ctx }) => {
    const connections = await ctx.prisma.connection.findMany({
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
      include: {
        firstUser: {
          select: {
            id: true,
            name: true,
            username: true,
            emoji: true,
          }
        },
        secondUser: {
          select: {
            id: true,
            name: true,
            username: true,
            emoji: true,
          }
        },
      },
    });

    return { connections };
  }),

  deleteConnection: protectedProcedure
    .input(
      z.object({
        connectionId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input: { connectionId } }) => {
      await ctx.prisma.connection.delete({
        where: {
          id: connectionId,
        },
      });
    }),
});
