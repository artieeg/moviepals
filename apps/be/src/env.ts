import { z } from "zod";

const envSchema = z.object({
  REDIS_URL: z.string(),
  HOST: z.string(),
  PORT: z
    .string()
    .default("3000")
    .transform((port) => Number(port)),
});

export const env = envSchema.parse(process.env);
