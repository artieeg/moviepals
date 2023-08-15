import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";

const MATCHES_PER_PAGE = 100;

export const matches = createTRPCRouter({
  getMatches: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        cursor: z.number().default(0),
      }),
    )
    .query(async ({ ctx, input: { userId, cursor } }) => {
      const matches = await ctx.dbMovieSwipe.swipes
        .find({
          userId: { $in: [userId, ctx.user] },
          liked: true,
        })
        .sort({ createdAt: -1 })
        .toArray();

      const uniqueMovieIds = new Set<number>();

      for (const match of matches) {
        uniqueMovieIds.add(match.movieId);
      }

      const movies = await ctx.dbMovieSwipe.movies
        .find({
          id: { $in: Array.from(uniqueMovieIds) },
        })
        .skip(cursor * MATCHES_PER_PAGE)
        .limit(MATCHES_PER_PAGE)
        .toArray();

      return { movies, nextCursor: cursor + 1 };
    }),
});
