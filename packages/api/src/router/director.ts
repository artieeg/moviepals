import { z } from "zod";

import { searchDirectors } from "../services";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const director = createTRPCRouter({
  search: protectedProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ input: { query } }) => {
      const result = await searchDirectors(query);

      return { directors: result };
    }),
});
