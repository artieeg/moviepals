import { DateTime } from "luxon";

import { appDb } from "@moviepals/db";
import { DbMovieSwipe } from "@moviepals/dbmovieswipe";

import { sendNotification } from "../services";

const USERS_PER_PAGE = 100;

export async function runNotificationWorker({
  db,
}: {
  db: DbMovieSwipe;
}) {
  /*
  const today = DateTime.utc();
  const target = DateTime.utc().set({ hour: 17 });

  const targetUserTimezoneOffset = target.diff(today, "hours").hours;

  let moreUsersAvailable = true;

  for (let page = 0; moreUsersAvailable; page++) {
    const users = await prisma.user.findMany({
      where: {
        timezoneOffset: targetUserTimezoneOffset,
        fcmToken: {
          not: null,
        },
      },
      select: {
        fcmToken: true,
      },
      skip: page * USERS_PER_PAGE,
      take: USERS_PER_PAGE,
    });

    if (users.length === 0) {
      moreUsersAvailable = false;
    }

    for (const user of users) {
      if (!user.fcmToken) {
        continue;
      }

      //60% chance
      const shouldSend = Math.random() < 0.6;

      if (shouldSend) {
        sendNotification({
          token: user.fcmToken,
          title: "Hey, it's time discover new movies",
          body: "Open MoviePals to see your daily movie recommendations",
        });
      }
    }
  }
   * */
}
