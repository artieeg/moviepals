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
    event: z.object({}).passthrough(),
  })
  .passthrough();

export async function main() {
  const redis = new Redis(env.USER_DELIVERY_CACHE_REDIS_URL, {
    lazyConnect: true,
    family: 6,
    reconnectOnError: () => true,
    retryStrategy: () => 100,
    keepAlive: 1,
  });

  redis.on("error", (err) => {
    logger.error("Redis cache error", err);
  });

  redis.on("close", async () => {
    logger.error("Redis cache close");
    await redis.connect();
  });

  redis.on("connect", () => {
    logger.error("Redis connect");
  });

  redis.on("reconnecting", () => {
    logger.error("Redis reconnecting");
  });

  redis.on("end", () => {
    logger.error("Redis end");
  });

  await Promise.all([connectAppDb(), dbMovieSwipe.connect(), redis.connect()]);

  setInterval(() => {
    redis.set("user-delivery-cache", Math.random());
  }, 400);

  const remoteApiResponseCache = new RemoteApiResponseCache(redis);

  const latestFeedResponseCache = new LatestFeedResponseCache(redis);

  const userFeedDeliveryCache = new UserFeedDeliveryCache(redis);

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
          dbMovieSwipe,
          userFeedDeliveryCache,
          latestFeedResponseCache,
          remoteApiResponseCache,
        });
      },
    },
  });

  server.post("/revcat/callback", async (msg, reply) => {
    logger.info(msg.body, "revenue cat");
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
