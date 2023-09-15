import { AppDb } from "@moviepals/db";

export async function getConnectedUserIds(userId: string, db: AppDb) {
  const connections = await db
    .selectFrom("Friend")
    .where((eb) =>
      eb.or([eb("firstUserId", "=", userId), eb("secondUserId", "=", userId)]),
    )
    .select(["firstUserId", "secondUserId"])
    .execute();

  const connectedUserIds = connections.map((connection) =>
    connection.firstUserId === userId
      ? connection.secondUserId
      : connection.firstUserId,
  );

  return connectedUserIds;
}
