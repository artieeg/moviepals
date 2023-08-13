import {
  CreateFastifyContextOptions,
  fastifyTRPCPlugin,
} from "@trpc/server/adapters/fastify";
import fastify from "fastify";
import { z } from "zod";

import {
  appRouter,
  createTRPCContext,
  dbMovieSwipe,
  prisma,
  verifyRewardedAd,
} from "@moviepals/api";

import { env } from "./env";

const server = fastify({
  maxParamLength: 10000,
});

const admobSchema = z.object({
  user_id: z.string(),
  ad_unit: z.string(),
  key_id: z.string(),
  signature: z.string(),
});

//TRPC
server.register(fastifyTRPCPlugin, {
  prefix: "/trpc",
  trpcOptions: {
    router: appRouter,
    createContext: (opts: CreateFastifyContextOptions) => {
      const { authorization } = opts.req.headers;
      const ip = opts.req.headers["x-forwarded-for"] ?? opts.req.ip;

      return createTRPCContext({ authorization, ip: ip as string });
    },
  },
});

export async function main() {
  await Promise.all([prisma.$connect(), dbMovieSwipe.connect()]);

  server.get("/admob/callback", async (msg, reply) => {
    console.log(msg.query);
    try {
      const { user_id, key_id, signature } = admobSchema.parse(msg.query);

      verifyRewardedAd({
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
