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
  UserFeedDeliveryCache,
  verifyRewardedAdCallback,
} from "@moviepals/api";
import { logger } from "@moviepals/api/src/logger";
import { appDb, connectAppDb } from "@moviepals/db";

import { env } from "./env";

const server = fastify({
  maxParamLength: 10000,
});

const revenueCatSchema = z
  .object({
    event: z
      .object({
        app_user_id: z.string(),
      })
      .passthrough(),
  })
  .passthrough();

export async function main() {
  const userDeliveryCacheClient = new Redis(env.USER_DELIVERY_CACHE_REDIS_URL, {
    lazyConnect: true,
    family: 6,
    reconnectOnError: () => true,
    retryStrategy: () => 100,
    keepAlive: 1,
  });

  userDeliveryCacheClient.on("error", (err) => {
    logger.error("User delivery cache error", err);
  });

  userDeliveryCacheClient.on("close", async () => {
    logger.error("User delivery cache close");
    await userDeliveryCacheClient.connect();
  });

  userDeliveryCacheClient.on("connect", () => {
    logger.error("user delivery cache connect");
  });

  userDeliveryCacheClient.on("reconnecting", () => {
    logger.error("User delivery cache reconnecting");
  });

  userDeliveryCacheClient.on("end", () => {
    logger.error("User delivery cache end");
  });

  const lastestFeedResponseCacheClient = new Redis(
    env.LATEST_FEED_RESPONSE_CACHE_REDIS_URL,
    {
      lazyConnect: true,
      family: 6,
      reconnectOnError: () => true,
      retryStrategy: () => 100,
      keepAlive: 1,
    },
  );

  lastestFeedResponseCacheClient.on("error", async (err) => {
    logger.error("User delivery cache error", err);
  });

  lastestFeedResponseCacheClient.on("close", async () => {
    logger.error("Latest feed response cache close");

    await lastestFeedResponseCacheClient.connect();
  });

  lastestFeedResponseCacheClient.on("connect", () => {
    logger.error("Latest feed response cache connect");
  });

  lastestFeedResponseCacheClient.on("reconnecting", () => {
    logger.error("Latest feed response cache reconnecting");
  });

  lastestFeedResponseCacheClient.on("end", () => {
    logger.error("Latest feed response cache end");
  });

  await Promise.all([
    connectAppDb(),
    dbMovieSwipe.connect(),
    userDeliveryCacheClient.connect(),
    lastestFeedResponseCacheClient.connect(),
  ]);

  setInterval(() => {
    userDeliveryCacheClient.set("user-delivery-cache", Math.random());
    lastestFeedResponseCacheClient.set("latest-feed-response", Math.random());
  }, 400);

  const latestFeedResponseCache = new LatestFeedResponseCache(
    lastestFeedResponseCacheClient,
  );

  const userFeedDeliveryCache = new UserFeedDeliveryCache(
    userDeliveryCacheClient,
  );

  server.get("/health", async () => {
    if (userDeliveryCacheClient.status !== "ready") {
      await userDeliveryCacheClient.connect()
      logger.error("USER_DELIVERY CACHE NOT READY");
    }

    if (lastestFeedResponseCacheClient.status !== "ready") {
      await lastestFeedResponseCacheClient.connect()
      logger.error("LATEST_FEED_RESPONSE CACHE NOT READY");
    }

    if (userDeliveryCacheClient.status !== "ready") {
      logger.error("USER_DELIVERY CACHE RECONNECT FAILED");
      throw new Error("USER_DELIVERY CACHE RECONNECT FAILED")
    }

    if (lastestFeedResponseCacheClient.status !== "ready") {
      logger.error("LATEST_FEED_RESPONSE CACHE RECONNECT FAILED");
      throw new Error("LATEST_FEED_RESPONSE CACHE RECONNECT FAILED")
    }

    userDeliveryCacheClient.ping();
    lastestFeedResponseCacheClient.ping();

    userDeliveryCacheClient.set("user-delivery-cache", Math.random());
    lastestFeedResponseCacheClient.set("latest-feed-response", Math.random());

    return {
      status: "ok",
      userDeliveryCacheClient: userDeliveryCacheClient.status,
      lastestFeedResponseCacheClient: lastestFeedResponseCacheClient.status,
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
          dbMovieSwipe,
          userFeedDeliveryCache,
          latestFeedResponseCache,
        });
      },
    },
  });

  server.post("/revcat/callback", async (msg, reply) => {
    logger.info(msg.body, "revenue cat");
    try {
      const {
        event: { app_user_id },
      } = revenueCatSchema.parse(msg.body);

      await handleFullAccessPurchase({
        header: msg.headers.authorization?.split(" ")[1] ?? "",
        user: app_user_id,
      });

      reply.status(200).send();
    } catch (e) {
      logger.error(e);
      reply.status(500).send();
    }
  });

  server.get("/admob/callback", async (msg, reply) => {
    logger.info(msg.query, "admob callback");

    console.log(msg.query);
    try {
      await verifyRewardedAdCallback({
        data: msg.query,
        userFeedDeliveryCache,
      });

      reply.status(200).send();
    } catch (e) {
      logger.error(e, "admob error");

      console.error(e);
      reply.status(400).send();
    }
  });

  /*
  await verifyRewardedAdCallback({
    data: {
      ad_network: "5450213213286189855",
      ad_unit: "2620773067",
      custom_data: "ca-app-pub-1972828603941935/2620773067",
      hostname: "7811370f506708",
      key_id: "3335741209",
      pid: 281,
      reward_amount: "40",
      reward_item: "swipes",
      signature:
        "MEQCIDKDIvVLDf7TBhIGaCXHel0oJB3D5ij5wUaYI-FQSK8dAiAgZbghNtdOGwLL6_699XejESz7d57Ww3NAliGzdQRAdQ",
      timestamp: "1693290466180",
      transaction_id: "00060409e7b3d17208bbe2752b0550b9",
      user_id: "zeghqztdmjfsz6bja1l3ug0f",
    },
    userFeedDeliveryCache,
  });
  */

  await server.listen({ port: env.PORT, host: env.HOST });
  logger.info(
    `Listening on ${env.HOST}:${env.PORT}, region: ${process.env.FLY_REGION}`,
  );
}
