import { API_BASE, GOOGLE_CLIENT_ID, TMDB_IMAGE_BASE } from "@env";
import { z } from "zod";

const envSchema = z.object({
  GOOGLE_CLIENT_ID: z.string(),
  API_BASE: z.string(),
  TMDB_IMAGE_BASE: z.string(),
});

export const env = envSchema.parse({
  GOOGLE_CLIENT_ID,
  API_BASE,
  TMDB_IMAGE_BASE,
});
