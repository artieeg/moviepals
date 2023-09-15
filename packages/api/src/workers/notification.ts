import { DateTime } from "luxon";

import { AppDb } from "@moviepals/db";
import { dbMovieSwipe, DbMovieSwipe } from "@moviepals/dbmovieswipe";

import { logger } from "../logger";
import { getConnectedUserIds, sendNotification } from "../services";

const USERS_PER_PAGE = 100;

export async function runNotificationWorker({
  db,
  appDb,
}: {
  db: DbMovieSwipe;
  appDb: AppDb;
}) {
  const today = DateTime.utc();
  const target = DateTime.utc().set({ hour: 17 });

  const targetUserTimezoneOffset = target.diff(today, "hours").hours;

  let moreUsersAvailable = true;

  for (let page = 0; moreUsersAvailable; page++) {
    const users = await fetchUserPage({
      page,
      targetUserTimezoneOffset,
      appDb,
    });

    for (const user of users) {
      const connectedUserIds = await getConnectedUserIds(user.id, appDb);
    }
  }
}

const inviteTemplatesNoFriends = [
  (name: string) => ({
    title: "Okay, hear us out... 👀",
    body: `${name} + friends + movies = tons of fun! Invite a friend and find tons of movies to watch together!`,
  }),
  (name: string) => ({
    title: "Don't movie alone! 🍿",
    body: `Get a friend by your side, ${name}! Invite, swipe, and find a bunch of stuff to watch together!`,
  }),
];

async function sendNewSwipeNotification(
  user: string,
  token: string,
  connections: string[],
  dbMovieSwipe: DbMovieSwipe,
  swipesAfterDate: Date,
) {
  const likedMoviesCount = await getNewMatchesCount(
    user,
    connections,
    swipesAfterDate,
    dbMovieSwipe,
  );
}

const inviteTemplatesOneFriend = [
  (name: string) => ({
    title: "Just one more friend! 🤞",
    body: `If you invite one more friend, all 3 of you will get a premium for free!`,
  }),
];

async function sendInviteNotification(
  user: string,
  token: string,
  connections: string[],
) {
  const template =
    connections.length === 1
      ? inviteTemplatesOneFriend[
          Math.floor(Math.random() * inviteTemplatesOneFriend.length)
        ]
      : inviteTemplatesNoFriends[
          Math.floor(Math.random() * inviteTemplatesNoFriends.length)
        ];

  if (!template) {
    return;
  }

  await sendNotification({
    ...template(user),
    token,
  });
}

async function sendSwipeReminderNotification(name: string, token: string) {
  await sendNotification({
    title: "Wanna swipe on movies later today?",
    body: "So many cool movies are waiting for you and your friends, " + name,
    token,
  });
}

async function fetchUserPage({
  page,
  appDb,
  targetUserTimezoneOffset,
}: {
  page: number;
  appDb: AppDb;
  targetUserTimezoneOffset: number;
}) {
  const users = await appDb
    .selectFrom("User")
    .where((eb) =>
      eb.and([
        eb("timezoneOffset", "=", targetUserTimezoneOffset),
        eb("fcmToken", "!=", null),
      ]),
    )
    .orderBy("id", "asc")
    .limit(USERS_PER_PAGE)
    .offset(page * USERS_PER_PAGE)
    .select(["fcmToken", "name", "id"])
    .execute();

  return users;
}

async function getNewMatchesCount(
  user: string,
  connections: string[],
  gtCreatedAt: Date,
  dbMovieSwipe: DbMovieSwipe,
) {
  const [friendSwipes, userSwipes] = await Promise.all([
    dbMovieSwipe.swipes
      .find(
        {
          userId: { $in: connections },
          liked: true,
        },
        { projection: { movieId: 1, userId: 1, created_at: 1 } },
      )
      .toArray(),
    dbMovieSwipe.swipes
      .find(
        {
          userId: user,
          liked: true,
        },
        { projection: { movieId: 1, userId: 1 } },
      )
      .toArray(),
  ]);

  let newMatchCount = 0;
  let totalMatchCount = 0;

  for (const swipe of friendSwipes) {
    for (const userSwipe of userSwipes) {
      if (swipe.movieId !== userSwipe.movieId) {
        continue;
      }

      if (swipe.userId === userSwipe.userId) {
        totalMatchCount++;

        if (swipe.created_at > gtCreatedAt) {
          newMatchCount++;
        }
      }
    }
  }

  return { newMatchCount, totalMatchCount };
}
