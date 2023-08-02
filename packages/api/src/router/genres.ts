import { genres as genreDefinitions } from "../genres";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const genres = createTRPCRouter({
  fetchUserGenres: protectedProcedure.query(async ({ ctx }) => {
    const enabledGenres = await ctx.prisma.enabledGenre.findMany({
      where: {
        userId: ctx.user,
      },
    });

    return genreDefinitions.map((genre) => ({
      ...genre,
      enabled: enabledGenres.some(
        (enabledGenre) => enabledGenre.genreId === genre.id
      ),
    }));
  }),
});
