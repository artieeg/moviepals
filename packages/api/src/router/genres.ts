import { z } from "zod";

import { genres as genreDefinitions } from "../genres";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const genres = createTRPCRouter({
  toggleAllGenres: protectedProcedure.mutation(async ({ ctx }) => {
    const genres = await ctx.prisma.enabledGenre.findMany({
      where: { userId: ctx.user },
    });

    const enabledGenres = await ctx.prisma.enabledGenre.findMany({
      where: {
        userId: ctx.user,
      },
    });

    const enabledGenreIds = enabledGenres.map(
      (enabledGenre) => enabledGenre.genreId,
    );

    const genresToEnable = genres.filter(
      (genre) => !enabledGenreIds.includes(genre.genreId),
    );

    await ctx.prisma.enabledGenre.createMany({
      data: genresToEnable.map((genre) => ({
        userId: ctx.user,
        genreId: genre.genreId,
      })),
    });
  }),

  toggleGenre: protectedProcedure
    .input(z.object({ genre: z.number(), enabled: z.boolean() }))
    .mutation(async ({ ctx, input: { genre, enabled } }) => {
      if (enabled) {
        await ctx.prisma.enabledGenre.create({
          data: {
            userId: ctx.user,
            genreId: genre,
          },
        });
      } else {
        await ctx.prisma.enabledGenre.delete({
          where: {
            userId_genreId: {
              userId: ctx.user,
              genreId: genre,
            },
          },
        });
      }
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
