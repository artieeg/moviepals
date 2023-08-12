import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const swipe = createTRPCRouter({
  reset: protectedProcedure
    .input(
      z.object({
        watch_providers: z.array(z.number()),
        genres: z.array(z.number()),
      }),
    )
    .mutation(async ({ ctx, input: { watch_providers, genres } }) => {
      const deleteSwipes = ctx.dbMovieSwipe.swipes.deleteMany({
        userId: ctx.user,
        movie_genre_ids: { $in: genres },
        movie_watch_providers:
          watch_providers.length > 0
            ? { $in: watch_providers }
            : { $exists: true },
      });

      const deleteReviewState = ctx.dbMovieSwipe.reviewState.deleteMany({
        userId: ctx.user,
        movie_genre_ids: { $in: genres },
        movie_watch_providers:
          watch_providers.length > 0
            ? { $in: watch_providers }
            : { $exists: true },
      });

      await Promise.all([deleteSwipes, deleteReviewState]);
    }),

  swipe: protectedProcedure
    .input(
      z.object({
        movieId: z.number(),
        watch_providers: z.array(z.number()),
        genres: z.array(z.number()),
        liked: z.boolean(),
        watch_region: z.string(),
        movie_language: z.string(),
      }),
    )
    .mutation(
      async ({
        ctx,
        input: {
          movieId,
          liked,
          genres,
          watch_providers,
          watch_region,
          movie_language,
        },
      }) => {
        await ctx.dbMovieSwipe.swipes.insertOne({
          userId: ctx.user,
          movieId,
          liked,
          movie_genre_ids: genres,
          watch_providers,
          movie_language,
          watch_region,
        });
      },
    ),
});
