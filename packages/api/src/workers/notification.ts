import { PrismaClient } from "@moviepals/db";
import { DbMovieSwipe } from "@moviepals/dbmovieswipe";

export async function runNotificationWorker({
  db,
  prisma,
}: {
  db: DbMovieSwipe;
  prisma: PrismaClient;
}) { }
