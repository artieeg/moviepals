import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const streaming_service = createTRPCRouter({
  toggleStreamingService: protectedProcedure
    .input(z.object({ streamingServiceId: z.string(), enabled: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      if (input.enabled) {
        await ctx.prisma.enabledStreamingService.create({
          data: {
            userId: ctx.user,
            streamingServiceId: input.streamingServiceId,
          },
        });
      } else {
        await ctx.prisma.enabledStreamingService.delete({
          where: {
            userId_streamingServiceId: {
              userId: ctx.user,
              streamingServiceId: input.streamingServiceId,
            },
          },
        });
      }
    }),

  getStreamingServices: protectedProcedure.query(async ({ ctx }) => {
    const [enabledStreamingServices, streamingServices] = await Promise.all([
      ctx.prisma.enabledStreamingService.findMany({
        where: {
          userId: ctx.user,
        },
      }),
      ctx.prisma.streamingService.findMany(),
    ]);

    const services = streamingServices.map((streamingService) => ({
      ...streamingService,
      enabled: enabledStreamingServices.some(
        (enabledStreamingService) =>
          enabledStreamingService.streamingServiceId === streamingService.id
      ),
    }));

    return {
      /** If user doens't have any services enabled, he's using any service by default */
      useAnyService: enabledStreamingServices.length === 0,

      services,
    };
  }),
});
