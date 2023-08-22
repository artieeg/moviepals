import * as jwt from "jsonwebtoken";

import { PrismaClient } from "@moviepals/db";

import { env } from "../utils/env";

export async function handleFullAccessPurchase({
  user,
  header,
  prisma,
}: {
  user: string;
  header: string;
  prisma: PrismaClient;
}) {
  jwt.verify(header, env.REVENUE_CAT_SECRET);

  await prisma.user.update({
    where: { id: user },
    data: {
      fullAccessPurchase: {
        create: {},
      },
    },
  });
}
