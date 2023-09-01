/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1)
 * 2. You want to create a new middleware or type of procedure (see Part 3)
 *
 * tl;dr - this is where all the tRPC server stuff is created and plugged in.
 * The pieces you will need to use are documented accordingly near the end
 */
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";

import { AppDb } from "@moviepals/db";
import { DbMovieSwipe } from "@moviepals/dbmovieswipe";

import { logger } from "./logger";
import {
  LatestFeedResponseCache,
  RemoteApiResponseCache,
  UserFeedDeliveryCache,
} from "./services";
import { verifyToken } from "./utils/jwt";

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API
 *
 * These allow you to access things like the database, the session, etc, when
 * processing a request
 *
 */
interface CreateContextOptions {
  user: string | null;
  ip: string;
  appDb: AppDb;
  dbMovieSwipe: DbMovieSwipe;
  userFeedDeliveryCache: UserFeedDeliveryCache;
  latestFeedResponseCache: LatestFeedResponseCache;
  remoteApiResponseCache: RemoteApiResponseCache;
}

export interface Context extends CreateContextOptions {}

/**
 * This helper generates the "internals" for a tRPC context. If you need to use
 * it, you can export it from here
 *
 * Examples of things you may need it for:
 * - testing, so we dont have to mock Next.js' req/res
 * - trpc's `createSSGHelpers` where we don't have req/res
 * @see https://create.t3.gg/en/usage/trpc#-servertrpccontextts
 */
const createInnerTRPCContext = (opts: CreateContextOptions) => {
  return {
    ...opts,
  };
};

/**
 * This is the actual context you'll use in your router. It will be used to
 * process every request that goes through your tRPC endpoint
 * @link https://trpc.io/docs/context
 */
export const createTRPCContext = async ({
  authorization,
  ip,
  appDb,
  dbMovieSwipe,
  userFeedDeliveryCache,
  latestFeedResponseCache,
  remoteApiResponseCache,
}: {
  authorization?: string;

  ip: string;
  appDb: AppDb;
  dbMovieSwipe: DbMovieSwipe;
  userFeedDeliveryCache: UserFeedDeliveryCache;
  latestFeedResponseCache: LatestFeedResponseCache;
  remoteApiResponseCache: RemoteApiResponseCache;
}) => {
  const token = authorization?.split(" ")[1];

  const claims = token ? verifyToken(token) : null;

  return createInnerTRPCContext({
    user: claims?.user ?? null,
    userFeedDeliveryCache,
    appDb,
    dbMovieSwipe,
    remoteApiResponseCache,
    latestFeedResponseCache,
    ip,
  });
};

/**
 * 2. INITIALIZATION
 *
 * This is where the trpc api is initialized, connecting the context and
 * transformer
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these
 * a lot in the /src/server/api/routers folder
 */

/**
 * This is how you create new routers and subrouters in your tRPC API
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * Reusable middleware that enforces users are logged in before running the
 * procedure
 */
const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user as string,
    },
  });
});

/**
 * Logger middleware
 */
export const loggerMiddleware = t.middleware(
  async ({ ctx, path, rawInput, next }) => {
    const p = performance.now();

    const response = await next({
      ctx,
    });

    const time = performance.now() - p;

    if (response.ok) {
      logger.info({
        elapsed: `${time.toFixed(2)}ms`,
        request: {
          path,
          ctx: {
            ip: ctx.ip,
            user: ctx.user,
          },
          input: rawInput,
        },
        //response: response.data,
      });
    } else {
      logger.error({
        elapsed: `${time.toFixed(2)}ms`,
        request: {
          path,
          ctx: {
            ip: ctx.ip,
            user: ctx.user,
          },
          input: rawInput,
        },
        error: response.error,
        cause: response.error?.cause,
        message: response.error?.message,
      });
    }

    return response;
  },
);

/**
 * Public (unauthed) procedure
 *
 * This is the base piece you use to build new queries and mutations on your
 * tRPC API. It does not guarantee that a user querying is authorized, but you
 * can still access user session data if they are logged in
 */
export const publicProcedure = t.procedure.use(loggerMiddleware);

/**
 * Protected (authed) procedure
 *
 * If you want a query or mutation to ONLY be accessible to logged in users, use
 * this. It verifies the session is valid and guarantees ctx.session.user is not
 * null
 *
 * @see https://trpc.io/docs/procedures
 */
export const protectedProcedure = t.procedure
  .use(loggerMiddleware)
  .use(enforceUserIsAuthed);
