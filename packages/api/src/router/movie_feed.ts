import { z } from "zod";

import { Movie, movieSchema } from "@moviepals/dbmovieswipe";

import { tmdb } from "../services";
import { createTRPCRouter, protectedProcedure } from "../trpc";

const TMDB_DISCOVER_MOVIE_COUNT = 20;
const MOVIES_PER_PAGE = 40;
const MIX_IN_MOVIES_COUNT = 10;

export const movie_feed = createTRPCRouter({
  getMovieFeed: protectedProcedure
    .input(
      z.object({
        region: z.string(),
        watchProviderIds: z.array(z.number()),
        genres: z.array(z.number()),
        next: z.object({
          /** Represent the page */
          tmdbNextPage: z.number(),
          tmdbStartFromMovieIdx: z.number(),
          appPage: z.number(),
        }),
      }),
    )
    .query(
      async ({ ctx, input: { next, genres, region, watchProviderIds } }) => {
        const connections = await ctx.prisma.connection.findMany({
          where: {
            OR: [
              {
                firstUserId: ctx.user,
              },
              {
                secondUserId: ctx.user,
              },
            ],
          },
        });

        const connectedUserIds = connections.map((connection) =>
          connection.firstUserId === ctx.user
            ? connection.secondUserId
            : connection.firstUserId,
        );

        const swipedMovieIds = (
          await ctx.prisma.swipe.findMany({
            where: { userId: ctx.user },
            select: { movieId: true },
          })
        ).map(({ movieId }) => movieId);

        const swipesByFriends = (
          await ctx.prisma.swipe.findMany({
            where: {
              userId: {
                in: connectedUserIds,
              },
              movieId: {
                notIn: swipedMovieIds,
              },
            },
            select: {
              movieId: true,
            },
          })
        ).map(({ movieId }) => movieId);

        const movieIdsToMixIn = pickRandomIds(
          swipesByFriends,
          MIX_IN_MOVIES_COUNT,
        );

        const moviesLeftToFetch = MOVIES_PER_PAGE - movieIdsToMixIn.length;
        const tmdbPagesToFetch = Math.ceil(
          moviesLeftToFetch / TMDB_DISCOVER_MOVIE_COUNT,
        );

        const tmdbPromises: ReturnType<typeof getMovies>[] = [];

        for (
          let currentPage = 0;
          currentPage < tmdbPagesToFetch;
          currentPage++
        ) {
          tmdbPromises.push(getMovies({}));
        }

        const nextTmdbStartFromMovieIdx =
          TMDB_DISCOVER_MOVIE_COUNT - next.tmdbStartFromMovieIdx;
        const nextTmdbPage = next.tmdbNextPage + tmdbPagesToFetch;

        const feed = [].slice(0, MOVIES_PER_PAGE);

        const shuffled = feed.sort(() => Math.random() - 0.5);

        return { feed: shuffled };
      },
    ),
});

function pickRandomIds(ids: number[], count: number) {
  const shuffled = ids.sort(() => Math.random() - 0.5);

  return shuffled.slice(0, count);
}

async function fetchMovieDetails(id: number) {
  const r = await tmdb.get(`movie/${id}`);

  const movie = movieSchema.parse(r.data);

  return movie;
}

