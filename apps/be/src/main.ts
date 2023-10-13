import {
  CreateFastifyContextOptions,
  fastifyTRPCPlugin,
} from "@trpc/server/adapters/fastify";
import fastify from "fastify";
import { Redis } from "ioredis";
import { z } from "zod";

import {
  appRouter,
  createTRPCContext,
  dbMovieSwipe,
  handleFullAccessPurchase,
  LatestFeedResponseCache,
  RemoteApiResponseCache,
  SwipeCountCache,
  verifyRewardedAdCallback,
  WatchedAdCountCache,
} from "@moviepals/api";
import { logger } from "@moviepals/api/src/logger";
import { appDb, connectAppDb } from "@moviepals/db";

import { env } from "./env";

const server = fastify({
  maxParamLength: 10000,
});

const revenueCatSchema = z
  .object({
    event: z.object({}).passthrough(),
  })
  .passthrough();

export async function main() {
  const redis = new Redis(
    env.REDIS_URL,
    process.env.NODE_ENV === "development"
      ? {
          lazyConnect: true,
        }
      : {
          lazyConnect: true,
          family: 6,
          reconnectOnError: () => true,
          retryStrategy: () => 100,
          keepAlive: 1,
        },
  );

  redis.on("error", (err) => {
    logger.error("Redis cache error", err);
  });

  redis.on("close", async () => {
    logger.error("Redis cache close");
    await redis.connect();
  });

  redis.on("connect", () => {
    logger.info("Redis connect");
  });

  redis.on("reconnecting", () => {
    logger.warn("Redis reconnecting");
  });

  redis.on("end", () => {
    logger.warn("Redis end");
  });

  await Promise.all([connectAppDb(), dbMovieSwipe.connect(), redis.connect()]);

  setInterval(() => {
    redis.set("user-delivery-cache", Math.random());
  }, 400);

  const remoteApiResponseCache = new RemoteApiResponseCache(redis);
  const latestFeedResponseCache = new LatestFeedResponseCache(redis);
  const watchedAdCountCache = new WatchedAdCountCache(redis);
  const swipeCountCache = new SwipeCountCache(redis);

  server.get("/health", async () => {
    if (redis.status !== "ready") {
      await redis.connect();
      logger.error("USER_DELIVERY CACHE NOT READY");
    }

    if (redis.status !== "ready") {
      logger.error("USER_DELIVERY CACHE RECONNECT FAILED");
      throw new Error("USER_DELIVERY CACHE RECONNECT FAILED");
    }

    redis.ping();
    redis.set("user-delivery-cache", Math.random());

    return {
      status: "ok",
      userDeliveryCacheClient: redis.status,
    };
  });

  //TRPC
  server.register(fastifyTRPCPlugin, {
    prefix: "/trpc",
    trpcOptions: {
      router: appRouter,
      createContext: (opts: CreateFastifyContextOptions) => {
        const { authorization } = opts.req.headers;
        const ip = opts.req.headers["x-forwarded-for"] ?? opts.req.ip;

        return createTRPCContext({
          authorization,
          ip: ip as string,
          appDb,
          swipeCountCache,
          dbMovieSwipe,
          watchedAdCountCache,
          latestFeedResponseCache,
          remoteApiResponseCache,
        });
      },
    },
  });

  server.post("/revcat/callback", async (msg, reply) => {
    try {
      const { event } = revenueCatSchema.parse(msg.body);

      const user =
        event.type === "TRANSFER"
          ? (event.transferred_to as string[])[0]!
          : (event.app_user_id as string);

      await handleFullAccessPurchase({
        header: msg.headers.authorization?.split(" ")[1] ?? "",
        user,
      });

      reply.status(200).send();
    } catch (e) {
      reply.status(400).send();
    }
  });

  server.get("/invite", async (msg, reply) => {
    logger.info(msg.query, "invite");
    try {
      const { code } = msg.query as { code: string };

      const result = await appDb
        .selectFrom("UserInviteLink")
        .where("slug", "=", code)
        .leftJoin("User", "User.userInviteSlugId", "UserInviteLink.slug")
        .select("User.name")
        .executeTakeFirst();

      if (!result?.name) {
        reply.status(404).send();
      } else {
        reply.status(200).send({ name: result.name });
      }
    } catch (e) {
      logger.error(e);
      reply.status(500).send();
    }
  });

  server.get("/invite", async (msg, reply) => {
    logger.info(msg.query, "invite");
    try {
      const { code } = msg.query as { code: string };

      const result = await appDb
        .selectFrom("UserInviteLink")
        .where("slug", "=", code)
        .leftJoin("User", "User.userInviteSlugId", "UserInviteLink.slug")
        .select("User.name")
        .executeTakeFirst();

      if (!result?.name) {
        reply.status(404).send();
      } else {
        reply.status(200).send({ name: result.name });
      }
    } catch (e) {
      logger.error(e);
      reply.status(500).send();
    }
  });

  server.get("/admob/callback", async (msg, reply) => {
    logger.info(msg.query, "admob callback");

    try {
      await verifyRewardedAdCallback({
        data: msg.query,
        watchedAdCountCache,
      });

      reply.status(200).send();
    } catch (e) {
      logger.error(e, "admob error");

      console.error(e);
      reply.status(400).send();
    }
  });

  await server.listen({ port: env.PORT, host: env.HOST });
  logger.info(
    `Listening on ${env.HOST}:${env.PORT}, region: ${process.env.FLY_REGION}`,
  );
}
