import { z } from "zod";

import { logger } from "../logger";
import { createTRPCRouter, protectedProcedure } from "../trpc";

const MATCHES_PER_PAGE = 100;

export const matches = createTRPCRouter({
  search: protectedProcedure
    .input(
      z.object({
        query: z.string().min(3),
        userIds: z.array(z.string()).max(6),
      }),
    )
    .query(async ({ ctx, input: { query, userIds } }) => {
      const swipes = await ctx.dbMovieSwipe.swipes
        .find(
          {
            userId: { $in: [ctx.user, ...userIds] },
            liked: true,
          },

          { projection: { movieId: 1 } },
        )
        .sort({ createdAt: -1 })
        .toArray();

      const movieEntryCount = new Map<number, number>();

      for (const swipe of swipes) {
        const prev = movieEntryCount.get(swipe.movieId) ?? 0;
        movieEntryCount.set(swipe.movieId, prev + 1);
      }

      const expectedEntryCount = userIds.length + 1;

      const matchedMovieIds = Array.from(movieEntryCount.entries())
        .filter(([, count]) => count === expectedEntryCount)
        .map(([key]) => key);

      const movies = await ctx.dbMovieSwipe.movies
        .find({
          id: { $in: Array.from(matchedMovieIds) },
          $text: { $search: query },
        })
        .limit(10)
        .toArray();

      return { movies };
    }),

  getMatches: protectedProcedure
    .input(
      z.object({
        /**
         * User ids to get common matches for. Max 6
         * */
        userIds: z.array(z.string()).max(6),
        cursor: z.number().default(0),
      }),
    )
    .query(async ({ ctx, input: { userIds, cursor } }) => {
      const swipes = await ctx.dbMovieSwipe.swipes
        .find(
          {
            userId: { $in: [ctx.user, ...userIds] },
            liked: true,
          },
          { projection: { movieId: 1 } },
        )
        .sort({ createdAt: -1 })
        .toArray();

      const movieEntryCount = new Map<number, number>();

      for (const swipe of swipes) {
        const prev = movieEntryCount.get(swipe.movieId) || 0;
        movieEntryCount.set(swipe.movieId, prev + 1);
      }

      const expectedEntryCount = userIds.length + 1;

      const matchedMovieIds = Array.from(movieEntryCount.entries())
        .filter(([, count]) => count === expectedEntryCount)
        .map(([key]) => key);

      const movies = await ctx.dbMovieSwipe.movies
        .find({
          id: { $in: matchedMovieIds },
        })
        .skip(cursor * MATCHES_PER_PAGE)
        .limit(MATCHES_PER_PAGE)
        .toArray();

      logger.info({
        returnedMovieIds: movies.map((movie) => movie.id),
      });

      return { movies, nextCursor: cursor + 1 };
    }),
});
