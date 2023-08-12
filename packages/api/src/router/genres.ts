import { z } from "zod";

import { genres as genreDefinitions } from "../genres";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const genres = createTRPCRouter({
  enableGenres: protectedProcedure
    .input(z.object({ genres: z.array(z.number()) }))
    .mutation(async ({ ctx, input: { genres } }) => {
      const disableUserGenres = ctx.prisma.enabledGenre.delete({
        where: {
          userId: ctx.user,
        },
      });
      await ctx.prisma.enabledGenre.create({
        data: {
          userId: ctx.user,
          genreId: genre,
        },
      });
    }),

  fetchUserGenres: protectedProcedure.query(async ({ ctx }) => {
    const enabledGenres = await ctx.prisma.enabledGenre.findMany({
      where: {
        userId: ctx.user,
      },
    });

    return genreDefinitions.map((genre) => ({
      ...genre,
      enabled: enabledGenres.some(
        (enabledGenre) => enabledGenre.genreId === genre.id,
      ),
    }));
  }),
});
