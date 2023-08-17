import cuid2 from "@paralleldrive/cuid2";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { DbMovieSwipe, Movie, ReviewState } from "@moviepals/dbmovieswipe";

import { logger } from "../logger";
import { getMovies } from "../services";
import { createTRPCRouter, protectedProcedure } from "../trpc";

/** Number of movies that TMDB returns */
const MOVIES_PER_TMDB_PAGE = 20;

/** Number of movies that we return to the client */
const MOVIES_PER_PAGE = 10;

/** Max number of movies that we mix in from friend swipes */
const MIX_IN_MOVIES_COUNT = 5;

export const movie_feed = createTRPCRouter({
  getMovieFeed: protectedProcedure
    .input(
      z.object({
        region: z.string(),
        watchProviderIds: z.array(z.number()),
        genres: z.array(z.number()),
        cast: z.array(z.number()),
        cursor: z.number().nullish(),
        quick_match_mode: z.boolean(),
      }),
    )
    .query(
      async ({
        ctx,
        input: {
          genres,
          quick_match_mode,
          cursor,
          region,
          cast,
          watchProviderIds,
        },
      }) => {
        const reviewStatePromise = getReviewState(ctx.dbMovieSwipe, {
          cast,
          genre_ids: genres,
          watch_providers: watchProviderIds,
          userId: ctx.user,
        });

        const userPromise = ctx.prisma.user.findUnique({
          where: {
            id: ctx.user,
          },
        });

        const connectionsPromise = ctx.prisma.connection.findMany({
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

        const userSwipesPromise = ctx.dbMovieSwipe.swipes
          .find({
            userId: ctx.user,

            //cast should overlap
            cast: cast.length > 0 ? { $in: cast } : { $exists: true },

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

        const [user, connections, reviewState, userSwipes] = await Promise.all([
          userPromise,
          connectionsPromise,
          reviewStatePromise,
          userSwipesPromise,
        ]);

        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        //Try to serve the latest feed response ...
        const latestFeedResponse =
          await ctx.latestFeedResponseCache.getLatestFeedResponse(
            reviewState.id,
          );

        if (latestFeedResponse) {
          return {
            feed: latestFeedResponse.filter(
              (m) => !userSwipes.some((s) => s.movieId === m.id),
            ),
            cursor: null,
          };
        }

        if (!user.fullAccessPurchaseId) {
          const state = await ctx.userFeedDeliveryCache.getDeliveryState(
            ctx.user,
          );

          // If user has been delivered feed earlier this day
          if (state) {
            if (state.page + 1 > state.ads_watched) {
              return {
                cursor: null,
                hasToWatchAd: true,
                feed: [],
              };
            }
          }
        }

        const connectedUserIds = connections.map((connection) =>
          connection.firstUserId === ctx.user
            ? connection.secondUserId
            : connection.firstUserId,
        );

        const excludeMovieIds = userSwipes.map((swipe) => swipe.movieId);

        /**
         * Fetch movies that friends have swiped on
         *
         * Make sure the genres and movie providers overlap
         * */
        const relevantFriendSwipes = await ctx.dbMovieSwipe.swipes
          .find({
            userId: { $in: connectedUserIds },
            movieId: { $nin: excludeMovieIds },
            liked: true,

            cast: cast.length > 0 ? { $in: cast } : { $exists: true },

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
          relevantFriendSwipes,
          MIX_IN_MOVIES_COUNT,
        );

        const selectedFriendSwipeMovieIds = randomFriendSwipes.map(
          (swipe) => swipe.movieId,
        );

        excludeMovieIds.push(...selectedFriendSwipeMovieIds);

        //If user has quick match mode enabled, and we couldn't find enough relevant friend-liked movies,
        //we want to mix in friend-liked movies regardless of genre and provider
        if (
          selectedFriendSwipeMovieIds.length < MIX_IN_MOVIES_COUNT &&
          quick_match_mode
        ) {
          const allFriendSwipes = await ctx.dbMovieSwipe.swipes
            .find({
              userId: { $in: connectedUserIds },
              movieId: { $nin: excludeMovieIds },
              liked: true,
            })
            .toArray();

          const randomAllFriendSwipes = pickRandomItems(
            allFriendSwipes,
            MIX_IN_MOVIES_COUNT - selectedFriendSwipeMovieIds.length,
          );

          const selectedAllFriendSwipeMovieIds = randomAllFriendSwipes.map(
            (swipe) => swipe.movieId,
          );

          excludeMovieIds.push(...selectedAllFriendSwipeMovieIds);
        }

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
            with_cast: cast,
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

        if (movies.length > 0) {
          await ctx.dbMovieSwipe.movies.insertMany(movies, { ordered: false });
        }

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
              cast: cast.length > 0 ? cast : { $exists: true },
              genre_ids: genres.length > 0 ? genres : { $exists: true },
              watch_providers:
                watchProviderIds.length > 0
                  ? watchProviderIds
                  : { $exists: true },
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

        const moviesWithLikes = [...movies, ...mixInMovies].map((movie) => {
          return {
            ...movie,
            likedByFriends: selectedFriendSwipeMovieIds.includes(movie.id),
          };
        });

        const feed = moviesWithLikes.sort(() => Math.random() - 0.5);

        await Promise.all([
          ctx.userFeedDeliveryCache.incPage(ctx.user),
          ctx.latestFeedResponseCache.setLatestFeedResponse(
            reviewState.id,
            feed,
          ),
        ]);

        return { feed, cursor };
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
    with_cast: number[];
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
          with_watch_providers: fetchParams.watchProviderIds.join(","),
          watch_region: fetchParams.region,
          with_genres: fetchParams.genres.join(","),
          with_cast: fetchParams.with_cast.join(","),
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

    if ((results.at(-1)?.length ?? 0) < moviesPerTmdbPage) {
      break;
    }

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
  params: Pick<
    ReviewState,
    "genre_ids" | "watch_providers" | "userId" | "cast"
  >,
): Promise<ReviewState> {
  console.log({
    userId: params.userId,
    genre_ids:
      params.genre_ids.length > 0
        ? { $all: params.genre_ids }
        : { $exists: true },
    watch_providers:
      params.watch_providers.length > 0
        ? { $all: params.watch_providers }
        : { $exists: true },
  });

  const reviewState = await db.reviewState.findOne({
    userId: params.userId,

    cast: params.cast.length > 0 ? { $in: params.cast } : { $exists: true },
    genre_ids:
      params.genre_ids.length > 0
        ? { $all: params.genre_ids }
        : { $exists: true },
    watch_providers:
      params.watch_providers.length > 0
        ? { $all: params.watch_providers }
        : { $exists: true },
  });

  if (reviewState) {
    return reviewState;
  } else {
    const reviewState: ReviewState = {
      id: cuid2.createId(),
      userId: params.userId,
      genre_ids: params.genre_ids,
      cast: [],
      watch_providers: params.watch_providers,
      remoteApiPage: 0,
      remoteApiResponseMovieIdx: 0,
    };

    await db.reviewState.insertOne(reviewState);

    return reviewState;
  }
}
