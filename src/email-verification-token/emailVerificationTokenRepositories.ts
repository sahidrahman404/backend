import type { DB } from "@/db/dbServices";
import { emailVerificationToken } from "@/email-verification-token/emailVerificationTokenSchemas";
import { eq } from "drizzle-orm";

export async function deleteEmailVerificationTokensByUserId(
  userId: string,
  db: DB,
) {
  await db
    .delete(emailVerificationToken)
    .where(eq(emailVerificationToken.userId, userId));
}

export type EmailVerificationCodeInput =
  typeof emailVerificationToken.$inferInsert;

export async function insertToken(input: EmailVerificationCodeInput, db: DB) {
  await db.insert(emailVerificationToken).values(input);
}

export async function getTokenById(tokenId: string, db: DB) {
  return await db.query.emailVerificationToken.findFirst({
    where: (emailVerificationCodes, { eq }) =>
      eq(emailVerificationCodes.id, tokenId),
  });
}
export async function deleteEmailVerificationTokenById(
  tokenId: string,
  db: DB,
) {
  await db
    .delete(emailVerificationToken)
    .where(eq(emailVerificationToken.id, tokenId));
}

export type Token = typeof emailVerificationToken.$inferSelect;
