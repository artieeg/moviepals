import { z } from "zod";

const envSchema = z.object({
  JWT_SECRET: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
});

export const env = envSchema.parse(process.env);
