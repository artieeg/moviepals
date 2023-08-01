import {
  CreateFastifyContextOptions,
  fastifyTRPCPlugin,
} from "@trpc/server/adapters/fastify";
import fastify from "fastify";

import { appRouter, createTRPCContext } from "@moviepals/api";

import { env } from "./env";

const server = fastify({
  maxParamLength: 10000,
});

//TRPC
server.register(fastifyTRPCPlugin, {
  prefix: "/trpc",
  trpcOptions: {
    router: appRouter,
    createContext: (opts: CreateFastifyContextOptions) => {
      const { authorization } = opts.req.headers;

      return createTRPCContext({ authorization });
    },
  },
});

export async function main() {
  await server.listen({ port: env.PORT, host: "0.0.0.0" });
}
