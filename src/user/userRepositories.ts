import { users } from "@/user/userSchemas";
import type { DB } from "@/db/dbServices";
import { eq } from "drizzle-orm";
import user from "@/user/index";

type UserInput = typeof users.$inferInsert;

export async function insertUser(input: UserInput, db: DB) {
  await db.insert(users).values(input);
}

export async function getUserById(userId: string, db: DB) {
  return await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.id, userId),
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
