import {createId} from "@paralleldrive/cuid2";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const feedback = createTRPCRouter({
  submit: protectedProcedure
    .input(
      z.object({
        rating: z.number().min(1).max(5),
        message: z.string(),
      }),
    )
    .mutation(async ({ ctx, input: { rating, message } }) => {
      await ctx.appDb
        .insertInto("Feedback")
        .values({
          id: createId(),
          userId: ctx.user,
          rating: rating,
          message: message,
        })
        .execute();
    }),
});
