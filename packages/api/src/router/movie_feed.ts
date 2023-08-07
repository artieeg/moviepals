import { z } from "zod";

import { PrismaClient } from "@moviepals/db";

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
        page: z.number(),
      }),
    )
    .query(
      async ({ ctx, input: { page, genres, region, watchProviderIds } }) => {
        //Find a way to strip out already reviewed movies
        const movies = await getMovies({
          watch_region: region,
          with_watch_providers: watchProviderIds.join(","),
          with_genres: genres.join(","),
          page,
        });

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

        const pickedSwipesByFriends = pickRandomIds(swipesByFriends, 10);

        const swipedByFriendsMovieData = await Promise.all(
          pickedSwipesByFriends.map((id) => fetchMovieDetailsCached(id)),
        );

        const feed = [
          ...movies.slice(0, 10),
          ...swipedByFriendsMovieData,
          ...movies.slice(10),
        ].slice(0, 20);

        const shuffled = feed.sort(() => Math.random() - 0.5);

        return {feed: shuffled};
      },
    ),
});

const fetchMovieDetailsCached = cachify(fetchMovieDetails);

function pickRandomIds(ids: number[], count: number) {
  const shuffled = ids.sort(() => Math.random() - 0.5);

  return shuffled.slice(0, count);
}

async function fetchMovieDetails(id: number) {
  const r = await tmdb.get(`movie/${id}`);

  const movie = zMovieSchema.parse(r.data);

  return movie;
}

async function getMovies(params: unknown) {
  const r = await tmdb.get("discover/movie", {
    params,
  });

  const { results: movies } = zMovieDiscoverResponseSchema.parse(r.data);

  return movies;
}

const zMovieSchema = z.object({
  adult: z.boolean(),
  backdrop_path: z.string(),
  genre_ids: z.array(z.number()),
  id: z.number(),
  original_language: z.string(),
  original_title: z.string(),
  overview: z.string(),
  popularity: z.number(),
  poster_path: z.string(),
  release_date: z.string(),
  title: z.string(),
  video: z.boolean(),
  vote_average: z.number(),
  vote_count: z.number(),
});

const zMovieDiscoverResponseSchema = z.object({
  page: z.number(),
  results: z.array(zMovieSchema),
});
