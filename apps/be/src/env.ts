import {z} from "zod";

const envSchema = z.object({
  PORT: z.string()
    .default("3000").transform((port) => Number(port))
})

export const env = envSchema.parse(process.env);
