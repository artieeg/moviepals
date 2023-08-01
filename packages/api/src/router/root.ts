import { createTRPCRouter } from "../trpc";
import { user } from "./user";

export const appRouter = createTRPCRouter({
  user,
});

// export type definition of API
export type AppRouter = typeof appRouter;
