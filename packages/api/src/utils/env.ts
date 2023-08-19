import { z } from "zod";

const envSchema = z.object({
  JWT_SECRET: z.string(),
  FIREBASE_CONFIG: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  TMDB_API_KEY: z.string(),
  REVENUE_CAT_SECRET: z.string(),
});

export const env = envSchema.parse(process.env);
