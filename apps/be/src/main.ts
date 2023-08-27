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

import { env } from "./env";
import {appDb, connectAppDb} from "@moviepals/db/src/db";

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
  });

  const lastestFeedResponseCacheClient = new Redis(
    env.LATEST_FEED_RESPONSE_CACHE_REDIS_URL,
    {
      lazyConnect: true,
      family: 6,
    },
  );

  const servedMovieIdsCacheClient = new Redis(
    env.SERVED_MOVIE_IDS_CACHE_REDIS_URL,
    {
      lazyConnect: true,
      family: 6,
    },
  );

  await Promise.all([
    //prisma.$connect(),
    connectAppDb(),
    dbMovieSwipe.connect(),
    userDeliveryCacheClient.connect(),
    lastestFeedResponseCacheClient.connect(),
    servedMovieIdsCacheClient.connect(),
  ]);

  const latestFeedResponseCache = new LatestFeedResponseCache(
    lastestFeedResponseCacheClient,
  );

  const userFeedDeliveryCache = new UserFeedDeliveryCache(
    userDeliveryCacheClient,
  );

  server.get("/health", async () => {
    return { status: "ok" };
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
    console.log(msg.body);
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

  await server.listen({ port: env.PORT, host: env.HOST });
}
