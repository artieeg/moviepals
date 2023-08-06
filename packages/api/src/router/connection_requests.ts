import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { logger } from "../logger";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const connection_requests = createTRPCRouter({
  postConnectionRequest: protectedProcedure
    .input(z.object({ user: z.string() }))
    .mutation(async ({ ctx, input: { user } }) => {
      logger.info(`postConnectionRequest: ${ctx.user} -> ${user}`);

      const request = await ctx.prisma.connectionRequest.create({
        data: {
          firstUserId: ctx.user,
          secondUserId: user,
        },
      });

      return { request };
    }),

  listConnectionRequests: protectedProcedure.query(async ({ ctx }) => {
    const requests = await ctx.prisma.connectionRequest.findMany({
      where: {
        secondUserId: ctx.user,
      },
      include: {
        firstUser: true,
      },
    });

    return { requests };
  }),

  countConnectionRequests: protectedProcedure.query(async ({ ctx }) => {
    const count = await ctx.prisma.connectionRequest.count({
      where: {
        secondUserId: ctx.user,
      },
    });

    return { count };
  }),

  deleteConnectionRequest: protectedProcedure
    .input(z.object({ user: z.string() }))
    .mutation(async ({ ctx, input: { user } }) => {
      //getting hacky here, cant use transaction because prisma throws if not found
      //cant use OR with unique indexes, so we have to do two queries

      //await ctx.prisma.$transaction([
      try {
        await ctx.prisma.connectionRequest.delete({
          where: {
            firstUserId_secondUserId: {
              firstUserId: ctx.user,
              secondUserId: user,
            },
          },
        });
      } catch {}

      try {
        await ctx.prisma.connectionRequest.delete({
          where: {
            firstUserId_secondUserId: {
              firstUserId: user,
              secondUserId: ctx.user,
            },
          },
        });
      } catch {}
      //]);
    }),

  acceptConnectionRequest: protectedProcedure
    .input(
      z.object({
        connectionRequestId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input: { connectionRequestId } }) => {
      const connectionRequest = await ctx.prisma.connectionRequest.findUnique({
        where: {
          id: connectionRequestId,
        },
      });

      if (!connectionRequest) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const [friendship] = await ctx.prisma.$transaction([
        ctx.prisma.connection.create({
          data: {
            firstUserId: connectionRequest.firstUserId,
            secondUserId: connectionRequest.secondUserId,
          },
          include: {
            firstUser: true,
            secondUser: true,
          },
        }),
        ctx.prisma.connectionRequest.delete({
          where: {
            id: connectionRequestId,
          },
        }),
      ]);

      return { friendship };
    }),
});
