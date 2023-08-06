import { z } from "zod";

import { getStreamingServices, isValidCountry } from "../services";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const streaming_service = createTRPCRouter({
  enableStreamingServices: protectedProcedure
    .input(
      z.object({
        country: z.string().refine(isValidCountry),
        streamingServiceIds: z.array(z.number()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.$transaction([
        ctx.prisma.user.update({
          where: { id: ctx.user },
          data: { country: input.country },
          select: null,
        }),
        ctx.prisma.enabledStreamingService.deleteMany({
          where: {
            userId: ctx.user,
          },
        }),
        ctx.prisma.enabledStreamingService.createMany({
          data: input.streamingServiceIds.map((streamingServiceId) => ({
            userId: ctx.user,
            streamingServiceId,
          })),
        }),
      ]);
    }),

  getStreamingServices: protectedProcedure
    .input(z.object({ country: z.string() }))
    .query(async ({ ctx, input: { country } }) => {
      const streamingServices = await getStreamingServices(country);

      const enabledStreamingServices =
        await ctx.prisma.enabledStreamingService.findMany({
          where: {
            userId: ctx.user,
          },
        });

      const services = streamingServices.map((streamingService) => ({
        ...streamingService,
        enabled: enabledStreamingServices.some(
          (enabledStreamingService) =>
            enabledStreamingService.streamingServiceId ===
            streamingService.provider_id,
        ),
      }));

      return {
        /** If user doens't have any services enabled, he's using any service by default */
        useAnyService: enabledStreamingServices.length === 0,

        services,
      };
    }),
});
