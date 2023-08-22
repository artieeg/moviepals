import * as jwt from "jsonwebtoken";
import { z } from "zod";

import { env } from "./env";

const claimsSchema = z.object({
  user: z.string(),
});

export type Claims = z.infer<typeof claimsSchema>;

export function createToken(claims: Claims) {
  return jwt.sign(claims, env.JWT_SECRET);
}

export function verifyToken(token: string) {
  const content = jwt.verify(token, env.JWT_SECRET);

  return claimsSchema.parse(content);
}
