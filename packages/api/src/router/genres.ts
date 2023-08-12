import { z } from "zod";

import { genres as genreDefinitions } from "../genres";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const genres = createTRPCRouter({
  enableGenres: protectedProcedure
    .input(z.object({ genres: z.array(z.number()) }))
    .mutation(async ({ ctx, input: { genres } }) => {
      const disableUserGenres = ctx.prisma.enabledGenre.deleteMany({
        where: {
          userId: ctx.user,
        },
      });

      const createUserGenres = ctx.prisma.enabledGenre.createMany({
        data: genres.map((genre) => ({
          userId: ctx.user,
          genreId: genre,
        })),
      });

      await ctx.prisma.$transaction([disableUserGenres, createUserGenres]);
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
