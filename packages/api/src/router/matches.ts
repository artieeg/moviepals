import { z } from "zod";

import { logger } from "../logger";
import { createTRPCRouter, protectedProcedure } from "../trpc";

const MATCHES_PER_PAGE = 100;

export const matches = createTRPCRouter({
  search: protectedProcedure
    .input(
      z.object({
        query: z.string().min(3),
        userId: z.string(),
      }),
    )
    .query(async ({ ctx, input: { query, userId } }) => {
      const matches = await ctx.dbMovieSwipe.swipes
        .find({
          userId: { $in: [userId, ctx.user] },
          liked: true,
        })
        .toArray();

      const uniqueMovieIds = new Set<number>();

      for (const match of matches) {
        uniqueMovieIds.add(match.movieId);
      }

      const movies = await ctx.dbMovieSwipe.movies
        .find({
          id: { $in: Array.from(uniqueMovieIds) },
          $text: { $search: query },
        })
        .limit(10)
        .toArray();

      return { movies };
    }),

  getMatches: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        cursor: z.number().default(0),
      }),
    )
    .query(async ({ ctx, input: { userId, cursor } }) => {
      const [userSwipes, friendSwipes] = await Promise.all([
        ctx.dbMovieSwipe.swipes
          .find({
            userId: ctx.user,
            liked: true,
          })
          .sort({ createdAt: -1 })
          .toArray(),
        ctx.dbMovieSwipe.swipes
          .find({
            userId,
            liked: true,
          })
          .sort({ createdAt: -1 })
          .toArray(),
      ]);

      const uniqueMovieIds = new Set<number>();

      for (const swipe of userSwipes) {
        if (
          friendSwipes.some(
            (friendSwipe) => friendSwipe.movieId === swipe.movieId,
          )
        ) {
          uniqueMovieIds.add(swipe.movieId);
        }
      }

      logger.info({
        uniqueMovieIds,
      });

      const movies = await ctx.dbMovieSwipe.movies
        .find({
          id: { $in: Array.from(uniqueMovieIds) },
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
