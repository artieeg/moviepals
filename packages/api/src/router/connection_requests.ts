import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const connection_requests = createTRPCRouter({
  request: protectedProcedure
    .input(z.object({ user: z.string() }))
    .mutation(async ({ ctx, input: { user } }) => {
      const request = ctx.prisma.connectionRequest.create({
        data: {
          firstUserId: ctx.user,
          secondUserId: user,
        },
      });

      return {request}
    }),

  confirm: protectedProcedure
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
            secondUser: true
          }
        }),
        ctx.prisma.connectionRequest.delete({
          where: {
            id: connectionRequestId,
          },
        }),
      ]);

      return {friendship};
    }),
});
