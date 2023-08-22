import { createId } from "@paralleldrive/cuid2";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";

const USER_SWIPES_PER_PAGE = 20;

export const swipe = createTRPCRouter({
  search: protectedProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ ctx, input: { query } }) => {
      const swipes = await ctx.dbMovieSwipe.swipes
        .find({
          userId: ctx.user,
        })
        .sort({ createdAt: -1 })
        .toArray();

      const uniqueMovieIds = Array.from(
        new Set(swipes.map((swipe) => swipe.movieId)),
      );

      const movies = await ctx.dbMovieSwipe.movies
        .find({
          id: { $in: uniqueMovieIds },
          $text: { $search: query },
        })
        .toArray();

      return { movies };
    }),

  fetchMySwipes: protectedProcedure
    .input(z.object({ cursor: z.number().default(0) }))
    .query(async ({ ctx, input: { cursor } }) => {
      const swipes = await ctx.dbMovieSwipe.swipes
        .find({
          userId: ctx.user,
        })
        .sort({ createdAt: -1 })
        .skip(cursor * USER_SWIPES_PER_PAGE)
        .limit(USER_SWIPES_PER_PAGE)
        .toArray();

      const uniqueMovieIds = Array.from(
        new Set(swipes.map((swipe) => swipe.movieId)),
      );

      const movies = await ctx.dbMovieSwipe.movies
        .find({
          id: { $in: uniqueMovieIds },
        })
        .toArray();

      return { movies, nextCursor: cursor + 1 };
    }),

  reset: protectedProcedure.mutation(async ({ ctx }) => {
    const deleteSwipes = ctx.dbMovieSwipe.swipes.deleteMany({
      userId: ctx.user,
    });

    const deleteReviewState = ctx.dbMovieSwipe.reviewState.deleteMany({
      userId: ctx.user,
    });

    await Promise.all([deleteSwipes, deleteReviewState]);
  }),

  swipe: protectedProcedure
    .input(
      z.object({
        movieId: z.number(),
        watch_providers: z.array(z.number()),
        cast: z.array(z.number()),
        directors: z.array(z.number()),
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
          cast,
          directors,
          movie_language,
        },
      }) => {
        await ctx.dbMovieSwipe.swipes.updateOne(
          {
            userId: ctx.user,
            movieId,
          },
          {
            $set: {
              id: createId(),
              userId: ctx.user,
              directors,
              cast,
              movieId,
              liked,
              movie_genre_ids: genres,
              watch_providers,
              movie_language,
              watch_region,
              created_at: new Date(),
            },
          },
          { upsert: true },
        );
      },
    ),
});
