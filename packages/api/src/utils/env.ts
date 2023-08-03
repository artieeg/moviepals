import { z } from "zod";

const envSchema = z.object({
  JWT_SECRET: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  TMDB_API_KEY: z.string(),
});

export const env = envSchema.parse(process.env);
