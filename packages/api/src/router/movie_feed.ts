import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { DbMovieSwipe, Movie, ReviewState } from "@moviepals/dbmovieswipe";

import { logger } from "../logger";
import { getMovies } from "../services";
import { createTRPCRouter, protectedProcedure } from "../trpc";

/** Number of movies that TMDB returns */
const MOVIES_PER_TMDB_PAGE = 20;

/** Number of movies that we return to the client */
const MOVIES_PER_PAGE = 40;

/** Max number of movies that we mix in from friend swipes */
const MIX_IN_MOVIES_COUNT = 10;

export const movie_feed = createTRPCRouter({
  getMovieFeed: protectedProcedure
    .input(
      z.object({
        region: z.string(),
        watchProviderIds: z.array(z.number()),
        genres: z.array(z.number()),
        cursor: z.number().nullish(),
        quick_match_mode: z.boolean(),
      }),
    )
    .query(
      async ({
        ctx,
        input: { genres, quick_match_mode, cursor, region, watchProviderIds },
      }) => {
        const reviewState = await getReviewState(ctx.dbMovieSwipe, {
          genre_ids: genres,
          watch_providers: watchProviderIds,
          userId: ctx.user,
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

        const userSwipes = await ctx.dbMovieSwipe.swipes
          .find({
            userId: ctx.user,

            //genres should overlap
            movie_genre_ids:
              genres.length > 0 ? { $in: genres } : { $exists: true },

            // movie providers should overlap
            watch_providers:
              watchProviderIds.length > 0
                ? { $in: watchProviderIds }
                : { $exists: true },
          })
          .toArray();

        const excludeMovieIds = userSwipes.map((swipe) => swipe.movieId);

        /**
         * Fetch movies that friends have swiped on
         *
         * Make sure the genres and movie providers overlap,
         * unless quick match mode is enabled
         * */
        const friendSwipes = await ctx.dbMovieSwipe.swipes
          .find({
            userId: { $in: connectedUserIds },
            movieId: { $nin: excludeMovieIds },
            liked: true,

            movie_genre_ids:
              !quick_match_mode && genres.length > 0
                ? { $in: genres }
                : { $exists: true },

            watch_providers:
              watchProviderIds.length > 0 && !quick_match_mode
                ? { $in: watchProviderIds }
                : { $exists: true },
          })
          .toArray();


        const randomFriendSwipes = pickRandomItems(
          friendSwipes,
          MIX_IN_MOVIES_COUNT,
        );

        const selectedFriendSwipeMovieIds = randomFriendSwipes.map(
          (swipe) => swipe.movieId,
        );

        console.log({selectedFriendSwipeMovieIds});

        excludeMovieIds.push(...selectedFriendSwipeMovieIds);

        const missingMoviesPromise = fetchMissingMovies({
          count: MOVIES_PER_PAGE,
          excludeMovieIds,
          moviesPerTmdbPage: MOVIES_PER_TMDB_PAGE,
          nextTmdbPage: reviewState.remoteApiPage,
          nextTmdbStartFromMovieIdx: reviewState.remoteApiResponseMovieIdx,
          mixInMovieCount: selectedFriendSwipeMovieIds.length,
          fetch: getMovies,
          fetchParams: {
            region,
            watchProviderIds,
            genres,
          },
        });

        const mixInMoviesPromise = ctx.dbMovieSwipe.movies
          .find({
            id: { $in: selectedFriendSwipeMovieIds },
          })
          .toArray();

        const [
          { movies, nextPageToStartFrom, nextMovieToStartFrom },
          mixInMovies,
        ] = await Promise.all([missingMoviesPromise, mixInMoviesPromise]);

        const expectedRemoteApiRequestCount = Math.floor(
          MOVIES_PER_PAGE / MOVIES_PER_TMDB_PAGE,
        );

        /**
         * Only update review state if we had to fetch more movies than we expected
         *
         * This allows us to let user continue their review from the movie they left off
         * in a simple way (though we end up making a redundant API call sometimes)
         * */
        if (
          nextPageToStartFrom - reviewState.remoteApiPage >=
          expectedRemoteApiRequestCount * 2
        ) {
          await ctx.dbMovieSwipe.reviewState.updateOne(
            {
              userId: ctx.user,
              genre_ids: genres.length > 0 ? genres : { $exists: true },
              watch_providers: watchProviderIds,
            },
            {
              $set: {
                //If the user hasn't finished the deck, this will
                //allow to continue from where they left off (more or less)
                remoteApiPage:
                  nextPageToStartFrom -
                  Math.ceil(expectedRemoteApiRequestCount / 2),
                remoteApiResponseMovieIdx: nextMovieToStartFrom,
              },
            },
          );
        }

        const feed = [...movies, ...mixInMovies].map((movie) => {
          return {
            ...movie,
            likedByFriends: selectedFriendSwipeMovieIds.includes(movie.id),
          };
        });

        const shuffled = feed.sort(() => Math.random() - 0.5);

        return { feed: shuffled, cursor };
      },
    ),
});

function pickRandomItems<T>(ids: T[], count: number) {
  const result = new Set<T>();

  do {
    for (let i = 0; i < count && i < ids.length; i++) {
      const randomIdx = Math.floor(Math.random() * ids.length);
      result.add(ids[randomIdx]!);
    }
  } while (result.size < count && count < ids.length);

  return [...result];
}

/**
 * Fetches movies from TMDB, excluding movies that have already been swiped
 * */
export async function fetchMissingMovies({
  count,
  excludeMovieIds,
  nextTmdbPage,
  nextTmdbStartFromMovieIdx,
  mixInMovieCount,
  moviesPerTmdbPage,
  fetch,
  fetchParams,
}: {
  /** How many movies to include in the response */
  count: number;

  excludeMovieIds: number[];
  moviesPerTmdbPage: number;
  nextTmdbPage: number;
  nextTmdbStartFromMovieIdx: number;
  mixInMovieCount: number;
  fetch: typeof getMovies;
  fetchParams: {
    region: string;
    watchProviderIds: number[];
    genres: number[];
  };
}) {
  const moviesLeftToFetch = count - mixInMovieCount;
  const tmdbPagesToFetch = Math.ceil(moviesLeftToFetch / moviesPerTmdbPage);

  let pageOffset = 0;
  let batch = tmdbPagesToFetch;

  const movies: Movie[] = [];
  let nextMovieToStartFrom: number = nextTmdbStartFromMovieIdx;
  let nextPageToStartFrom: number = nextTmdbPage;

  let attempts = 20; //tmdbPagesToFetch * 2;

  while (attempts--) {
    const promises: Promise<Movie[]>[] = [];

    for (let p = 0; p < batch; pageOffset++, p++) {
      promises.push(
        fetch({
          ...fetchParams,
          genres: fetchParams.genres.join(","),
          page: nextTmdbPage + pageOffset + 1,
        }),
      );
    }

    const results = await Promise.all(promises);

    const fetchedMovies = results.flat();
    const filteredMovies = fetchedMovies.filter(
      (movie) => !excludeMovieIds.includes(movie.id),
    );
    const selectedMovies = filteredMovies.slice(
      nextTmdbStartFromMovieIdx,
      nextTmdbStartFromMovieIdx + moviesLeftToFetch,
    );

    movies.push(...selectedMovies);

    if (movies.length >= moviesLeftToFetch) {
      nextMovieToStartFrom =
        nextTmdbStartFromMovieIdx === 0
          ? 0
          : nextTmdbPage - nextTmdbStartFromMovieIdx;

      nextPageToStartFrom = nextTmdbPage + pageOffset;

      break;
    } else {
      batch = Math.ceil(batch / 2);
    }
  }

  if (movies.length === 0 && attempts === 0) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to fetch movies",
    });
  } else {
    return {
      movies,
      nextMovieToStartFrom,
      nextPageToStartFrom,
    };
  }
}

async function getReviewState(
  db: DbMovieSwipe,
  params: Pick<ReviewState, "genre_ids" | "watch_providers" | "userId">,
): Promise<ReviewState> {
  const reviewState = await db.reviewState.findOne({
    userId: params.userId,
    genre_ids: params.genre_ids
      ? { $all: params.genre_ids }
      : { $exists: true },
    watch_providers: params.watch_providers
      ? { $all: params.watch_providers }
      : { $exists: true },
  });

  if (reviewState) {
    return reviewState;
  } else {
    const reviewState: ReviewState = {
      userId: params.userId,
      genre_ids: params.genre_ids,
      watch_providers: params.watch_providers,
      remoteApiPage: 0,
      remoteApiResponseMovieIdx: 0,
    };

    await db.reviewState.insertOne(reviewState);

    return reviewState;
  }
}
