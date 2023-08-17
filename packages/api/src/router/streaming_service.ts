import {TRPCError} from "@trpc/server";
import { z } from "zod";

import { getStreamingServices, isValidCountry } from "../services";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const streaming_service = createTRPCRouter({
  getStreamingServices: protectedProcedure
    .input(z.object({ country: z.string() }))
    .query(async ({ input: { country } }) => {
      if (!isValidCountry(country)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid country",
        });
      }

      const services = await getStreamingServices(country);

      return {
        services,
      };
    }),
});
