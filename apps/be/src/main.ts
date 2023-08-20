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
  prisma,
  ServedMovieIdsCache,
  UserFeedDeliveryCache,
  verifyRewardedAdCallback,
} from "@moviepals/api";

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
  });

  const lastestFeedResponseCacheClient = new Redis(
    env.LATEST_FEED_RESPONSE_CACHE_REDIS_URL,
    {
      lazyConnect: true,
    },
  );

  const servedMovieIdsCacheClient = new Redis(
    env.SERVED_MOVIE_IDS_CACHE_REDIS_URL,
    {
      lazyConnect: true,
    },
  );

  await Promise.all([
    prisma.$connect(),
    dbMovieSwipe.connect(),
    userDeliveryCacheClient.connect(),
    lastestFeedResponseCacheClient.connect(),
    servedMovieIdsCacheClient.connect(),
  ]);

  const servedMovieIdsCache = new ServedMovieIdsCache(
    lastestFeedResponseCacheClient,
  );

  const latestFeedResponseCache = new LatestFeedResponseCache(
    lastestFeedResponseCacheClient,
  );

  const userFeedDeliveryCache = new UserFeedDeliveryCache(
    userDeliveryCacheClient,
  );

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
          userFeedDeliveryCache,
          latestFeedResponseCache,
          servedMovieIdsCache,
        });
      },
    },
  });

  server.post("/revcat/callback", async (msg, reply) => {
    console.log(msg.body);
    try {
      const {
        event: { app_user_id },
      } = revenueCatSchema.parse(msg.body);

      await handleFullAccessPurchase({
        header: msg.headers.authorization?.split(" ")[1] ?? "",
        user: app_user_id,
        prisma,
      });

      reply.status(200).send();
    } catch (e) {
      reply.status(500).send();
    }
  });

  server.get("/admob/callback", async (msg, reply) => {
    console.log(msg.query);
    try {
      await verifyRewardedAdCallback({
        data: msg.query,
        userFeedDeliveryCache,
      });

      reply.status(200).send();
    } catch (e) {
      console.log(e);
      reply.status(400).send();
    }
  });

  await server.listen({ port: env.PORT, host: "0.0.0.0" });
}
