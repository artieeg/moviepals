import { z } from "zod";

import { getPopularCast, searchCast } from "../services";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const cast = createTRPCRouter({
  search: protectedProcedure
    .input(
      z.object({
        query: z.string(),
      }),
    )
    .query(async ({ input: { query } }) => {
      const cast = await searchCast(query);

      return {
        cast,
      };
    }),

  fetchPopularCast: protectedProcedure
    .input(
      z.object({
        cursor: z.number().min(1).default(1),
      }),
    )
    .query(async ({ input: { cursor } }) => {
      const cast = await getPopularCast(cursor);

      return {
        cast,
        nextCursor: cursor + 1,
      };
    }),
});
