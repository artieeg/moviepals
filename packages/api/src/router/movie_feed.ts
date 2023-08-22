import { createId } from "@paralleldrive/cuid2";
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
        directors: z.array(z.number()),
        cast: z.array(z.number()),
        cursor: z.number().default(0),
        quick_match_mode: z.boolean(),
      }),
    )
    .query(
      async ({
        ctx,
        input: {
          genres,
          quick_match_mode,
          directors,
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
          directors,
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

            //Filters below are not necessary,
            //but they help reduce the load

            directors:
              directors.length > 0 ? { $in: directors } : { $exists: true },

            //cast should overlap
            cast: cast.length > 0 ? { $in: cast } : { $exists: true },

            movie_genre_ids:
              genres.length > 0 ? { $in: genres } : { $exists: true },

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

        const connectedUserIds = connections.map((connection) =>
          connection.firstUserId === ctx.user
            ? connection.secondUserId
            : connection.firstUserId,
        );

        const excludeMovieIds = userSwipes.map((swipe) => swipe.movieId);

        const servedMovieIds = await ctx.servedMovieIdsCache.getMovieIds(
          ctx.user,
        );

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

        //Try to serve the latest feed response ...
        const latestFeedResponse =
          await ctx.latestFeedResponseCache.getLatestFeedResponse(
            reviewState.id,
          );

        const validMoviesFromLatestResponse =
          latestFeedResponse?.filter((m) => !excludeMovieIds.includes(m.id)) ??
          [];

        if (validMoviesFromLatestResponse.length > 0) {
          return {
            feed: validMoviesFromLatestResponse,
            cursor: null,
          };
        }

        if (!user.fullAccessPurchaseId) {
          const state = await ctx.userFeedDeliveryCache.getDeliveryState(
            ctx.user,
          );

          // If user has been delivered feed earlier this day
          if (state) {
            if (state.page > state.ads_watched) {
              return {
                cursor: null,
                hasToWatchAd: true,
                feed: [],
              };
            }
          }
        }

        excludeMovieIds.push(...servedMovieIds);

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
            with_people: directors,
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

        logger.info({
          nextPageToStartFrom,
          remoteApiPage: reviewState.remoteApiPage,
          expectedRemoteApiRequestCount,
          result:
            nextPageToStartFrom - reviewState.remoteApiPage >=
            expectedRemoteApiRequestCount * 2,
        });

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

              directors:
                directors.length > 0 ? { $in: directors } : { $exists: true },
              cast: cast.length > 0 ? { $in: cast } : { $exists: true },
              genre_ids:
                genres.length > 0 ? { $all: genres } : { $exists: true },
              watch_providers:
                watchProviderIds.length > 0
                  ? { $all: watchProviderIds }
                  : { $exists: true },
            },
            {
              $set: {
                remoteApiPage: nextPageToStartFrom,
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

        let responseShouldBeCounted = true;

        if (feed.length === 0) {
          if (cursor === 0) {
            responseShouldBeCounted = false;
            return { feed, cursor, unableToFindMovies: true };
          } else {
            return { feed, cursor, noMoreMovies: true };
          }
        }

        if (responseShouldBeCounted) {
          await Promise.all([
            ctx.userFeedDeliveryCache.incPage(ctx.user),
            ctx.latestFeedResponseCache.setLatestFeedResponse(
              reviewState.id,
              feed,
            ),
          ]);
        }

        console.log({
          previouslyServedMovieIds: servedMovieIds,
          newMovieIds: feed.map((m) => m.id),
        });

        ctx.servedMovieIdsCache.addMovieIds(
          ctx.user,
          feed.map((m) => m.id),
        );

        return { feed, cursor: cursor + 1 };
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

  return Array.from(result);
}

/**
 * Fetches movies from TMDB, excluding movies that have already been swiped
 * */
export async function fetchMissingMovies({
  count,
  excludeMovieIds,
  nextTmdbPage,
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
    with_people: number[];
    watchProviderIds: number[];
    genres: number[];
  };
}) {
  const moviesLeftToFetch = count - mixInMovieCount;
  const tmdbPagesToFetch = Math.ceil(moviesLeftToFetch / moviesPerTmdbPage);

  const promises: Promise<Movie[]>[] = [];

  //Refetching the same page is intended
  for (let page = 0; page <= tmdbPagesToFetch; page++) {
    promises.push(
      fetch({
        with_watch_providers: fetchParams.watchProviderIds.join(","),
        watch_region: fetchParams.region,
        with_genres: fetchParams.genres.join(","),
        with_cast: fetchParams.with_cast.join(","),
        with_people: fetchParams.with_people.join(","),
        page: nextTmdbPage + page,
      }),
    );
  }

  const results = await Promise.all(promises);

  const movies: Movie[] = [];
  let nextPageToStartFrom = nextTmdbPage;

  for (const result of results) {
    for (const movie of result) {
      if (!excludeMovieIds.includes(movie.id)) {
        movies.push(movie);
      }
    }

    if (movies.length >= moviesLeftToFetch) {
      break;
    } else {
      nextPageToStartFrom++;
    }
  }

  return {
    movies,
    nextMovieToStartFrom: 0,
    nextPageToStartFrom,
  };

  /*
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
          with_people: fetchParams.with_people.join(","),
          page: nextTmdbPage + pageOffset,
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
   * */
}

async function getReviewState(
  db: DbMovieSwipe,
  params: Pick<
    ReviewState,
    "genre_ids" | "watch_providers" | "userId" | "cast" | "directors"
  >,
): Promise<ReviewState> {
  const reviewState = await db.reviewState.findOne({
    userId: params.userId,

    directors:
      params.directors.length > 0
        ? { $in: params.directors }
        : { $exists: true },
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
      id: createId(),
      userId: params.userId,
      genre_ids: params.genre_ids,
      directors: [],
      cast: [],
      watch_providers: params.watch_providers,
      remoteApiPage: 1,
      remoteApiResponseMovieIdx: 0,
    };

    await db.reviewState.insertOne(reviewState);

    return reviewState;
  }
}
