import type { ColumnType } from "kysely";

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export type Connection = {
  id: string;
  firstUserId: string;
  secondUserId: string;
};
export type ConnectionRequest = {
  id: string;
  firstUserId: string;
  secondUserId: string;
  rejected: Generated<boolean>;
  createdAt: Generated<Timestamp>;
};
export type Feedback = {
  id: string;
  message: string;
  rating: number;
  userId: string;
};
export type FullAccessPurchase = {
  id: string;
  source: string;
  createdAt: Generated<Timestamp>;
};
export type SharedPremium = {
  id: string;
  createdAt: Generated<Timestamp>;
  userId: string | null;
  purchaseId: string | null;
};
export type UnlockedCategory = {
  categoryId: string;
  userId: string;
  createdAt: Generated<Timestamp>;
};
export type User = {
  id: string;
  name: string;
  email: string;
  sub: string;
  username: string;
  timezoneOffset: Generated<number>;
  fcmToken: string | null;
  allowPushNotifications: Generated<boolean>;
  joinedMailingList: Generated<boolean>;
  emoji: Generated<string>;
  inviteApplied: Generated<boolean>;
  userInviteSlugId: string;
  fullAccessPurchaseId: string | null;
  createdAt: Generated<Timestamp>;
};
export type UserInviteLink = {
  slug: string;
  createdAt: Generated<Timestamp>;
};
export type DB = {
  ConnectionRequest: ConnectionRequest;
  Feedback: Feedback;
  Friend: Connection;
  FullAccessPurchase: FullAccessPurchase;
  SharedPremium: SharedPremium;
  UnlockedCategory: UnlockedCategory;
  User: User;
  UserInviteLink: UserInviteLink;
};
