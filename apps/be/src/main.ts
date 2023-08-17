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
  prisma,
  UserFeedDeliveryCache,
  verifyRewardedAd,
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

const admobSchema = z.object({
  user_id: z.string(),
  ad_unit: z.string(),
  key_id: z.string(),
  signature: z.string(),
});

export async function main() {
  const userDeliveryCacheClient = new Redis(env.USER_DELIVERY_CACHE_REDIS_URL, {
    lazyConnect: true,
  });

  await Promise.all([
    prisma.$connect(),
    dbMovieSwipe.connect(),
    userDeliveryCacheClient.connect(),
  ]);

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
      const { user_id, key_id, signature } = admobSchema.parse(msg.query);

      await verifyRewardedAd({
        userId: user_id,
        prisma,
        key_id,
        signature,
      });

      reply.status(200).send();
    } catch (e) {
      reply.status(400).send();
    }
  });

  await server.listen({ port: env.PORT, host: "0.0.0.0" });
}
