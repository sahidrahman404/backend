import { users } from "@/user/userSchemas";
import type { DB } from "@/db/dbServices";
import { count, eq, sql } from "drizzle-orm";

type UserInput = typeof users.$inferInsert;

export async function insertUser(input: UserInput, db: DB) {
  await db.insert(users).values(input);
}

export async function getUserById(userId: string, db: DB) {
  return await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.id, userId),
  });
}

export async function increaseUserLoggedInCount(userId: string, db: DB) {
  await db
    .update(users)
    .set({
      loggedInCount: sql`${users.loggedInCount} + 1`,
    })
    .where(eq(users.id, userId));
}

export async function updateLastLoggedOutAt(userId: string, db: DB) {
  await db
    .update(users)
    .set({
      lastLoggedOutAt: new Date(Date.now()),
    })
    .where(eq(users.id, userId));
}

export async function getUserByGoogleId(googleId: string, db: DB) {
  return await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.googleId, googleId),
  });
}

export async function getUserFacebookId(facebookId: string, db: DB) {
  return await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.facebookId, facebookId),
  });
}

export async function updateUserEmailVerified(
  userId: string,
  verified: boolean,
  db: DB,
) {
  await db
    .update(users)
    .set({
      emailVerified: verified,
    })
    .where(eq(users.id, userId));
}

export async function getUserByEmail(email: string, db: DB) {
  return await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.email, email),
  });
}

export async function updateUserPassword(
  userId: string,
  passwordHash: string,
  db: DB,
) {
  await db
    .update(users)
    .set({
      passwordHash: passwordHash,
    })
    .where(eq(users.id, userId));
}

export async function getUsersStats(db: DB) {
  return await db.query.users.findMany({
    columns: {
      lastLoggedOutAt: true,
      loggedInCount: true,
      createdAt: true,
    },
  });
}

export async function getUsersCount(db: DB) {
  return await db
    .select({ count: sql<number>`count(${users.id})` })
    .from(users);
}

export async function updateUserName(userId: string, name: string, db: DB) {
  await db
    .update(users)
    .set({
      name: name,
    })
    .where(eq(users.id, userId));
}
