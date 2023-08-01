import { API_BASE, GOOGLE_CLIENT_ID } from "@env";
import { z } from "zod";

const envSchema = z.object({
  GOOGLE_CLIENT_ID: z.string(),
  API_BASE: z.string(),
});

export const env = envSchema.parse({
  GOOGLE_CLIENT_ID,
  API_BASE,
});
