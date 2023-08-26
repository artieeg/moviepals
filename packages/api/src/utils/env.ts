import { z } from "zod";

const schemaBase = {
  JWT_SECRET: z.string(),
  FIREBASE_CONFIG: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  TMDB_API_KEY: z.string(),
  REVENUE_CAT_SECRET: z.string(),
};

const envSchema = z.discriminatedUnion("NODE_ENV", [
  z.object({ NODE_ENV: z.literal("development") }).extend(schemaBase),
  z
    .object({
      NODE_ENV: z.literal("production"),
      AXIOM_TOKEN: z.string(),
      AXIOM_DATASET: z.string(),
    })
    .extend(schemaBase),
]);

export const env = envSchema.parse(process.env);
