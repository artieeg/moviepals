import { z } from "zod";

import { PrismaClient } from "@moviepals/db";
import { movieSchema } from "@moviepals/dbmovieswipe";

import { tmdb } from "../services";
import { cachify } from "../services/cache";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const movie_feed = createTRPCRouter({
  getMovieFeed: protectedProcedure
    .input(
      z.object({
        region: z.string(),
        watchProviderIds: z.array(z.number()),
        genres: z.array(z.number()),
        next: z.object({
          /** Represent the page */
          tmdbPage: z.number(),
          appPage: z.number()
        })
      }),
    )
    .query(
      async ({ ctx, input: { page, genres, region, watchProviderIds } }) => {
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

        const movieIdsToMixIn = pickRandomIds(swipesByFriends, 10);

        const tmdbMoviePage = await getMovies({
          watch_region: region,
          with_watch_providers: watchProviderIds.join(","),
          with_genres: genres.join(","),
          page,
        });

        const feed = [].slice(0, 20);

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

const getMoviesSchema = z.object({
  results: z.array(movieSchema),
});

async function getMovies(params: unknown) {
  const r = await tmdb.get("discover/movie", {
    params,
  });

  const { results: movies } = getMoviesSchema.parse(r.data);

  return movies;
}
