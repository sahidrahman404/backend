import type { DB } from "@/db/dbServices";
import { resetPasswordTokens } from "@/reset-password-token/resetPasswordTokenSchemas";
import { eq } from "drizzle-orm";

export async function deleteResetPasswordTokensByUserId(
  userId: string,
  db: DB,
) {
  await db
    .delete(resetPasswordTokens)
    .where(eq(resetPasswordTokens.userId, userId));
}

export type ResetPasswordTokenInput = typeof resetPasswordTokens.$inferInsert;

export async function insertResetPasswordToken(
  input: ResetPasswordTokenInput,
  db: DB,
) {
  await db.insert(resetPasswordTokens).values(input);
}

export async function getResetPasswordTokenByTokenHash(
  tokenHash: string,
  db: DB,
) {
  return await db.query.resetPasswordTokens.findFirst({
    where: (resetPasswordTokens, { eq }) =>
      eq(resetPasswordTokens.tokenHash, tokenHash),
  });
}

export async function deleteResetPasswordTokenByTokenHash(
  tokenHash: string,
  db: DB,
) {
  await db
    .delete(resetPasswordTokens)
    .where(eq(resetPasswordTokens.tokenHash, tokenHash));
}
