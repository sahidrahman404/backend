import { TimeSpan, createDate, isWithinExpirationDate } from "oslo";
import type { DB } from "@/db/dbServices";
import {
  deleteEmailVerificationTokenById,
  deleteEmailVerificationTokensByUserId,
  getTokenById,
  insertToken,
} from "@/email-verification-token/emailVerificationTokenRepositories";
import { generateIdFromEntropySize } from "lucia";
import AppError from "@/error/appError";
import { config } from "@/config";
import { sendVerificationCode } from "@/email-verification-token/emailVerification";

export async function generateEmailVerificationTokenService(
  userId: string,
  email: string,
  db: DB,
): Promise<string> {
  const tokenId = await db.transaction(async (tx) => {
    await deleteEmailVerificationTokensByUserId(userId, db);
    const tokenId = generateIdFromEntropySize(25);
    await insertToken(
      {
        id: tokenId,
        userId,
        email,
        expiresAt: createDate(new TimeSpan(15, "m")),
      },
      db,
    );

    return tokenId;
  });
  return tokenId;
}

export async function resendEmailVerificationTokenService(
  userId: string,
  email: string,
  db: DB,
) {
  await db.transaction(async (tx) => {
    const verificationToken = await generateEmailVerificationTokenService(
      userId,
      email,
      tx,
    );
    const verificationLink = `${config.server.basePath}/v1/email-verification/${verificationToken}`;
    await sendVerificationCode(email, verificationLink);
  });
}

export async function verifyTokenService(verificationToken: string, db: DB) {
  const token = await db.transaction(async (tx) => {
    const token = await getTokenById(verificationToken, db);
    if (!token || !isWithinExpirationDate(token.expiresAt)) {
      throw new AppError(401, "You are not authorized to access this resource");
    }
    await deleteEmailVerificationTokenById(verificationToken, db);
    return token;
  });
  return token;
}
