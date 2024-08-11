import type { DB } from "@/db/dbServices";
import {
  deleteResetPasswordTokenByTokenHash,
  deleteResetPasswordTokensByUserId,
  getResetPasswordTokenByTokenHash,
  insertResetPasswordToken,
} from "@/reset-password-token/resetPasswordTokenRepositories";
import { generateIdFromEntropySize } from "lucia";
import { encodeHex } from "oslo/encoding";
import { sha256 } from "oslo/crypto";
import { createDate, isWithinExpirationDate, TimeSpan } from "oslo";
import {
  getUserByEmailService,
  updateUserPasswordService,
} from "@/user/userServices";
import AppError from "@/error/appError";
import { config } from "@/config";
import { sendResetToken } from "@/reset-password-token/resetPasswordToken";
import { hashConfig, lucia } from "@/lucia/luciaServices";
import { hash } from "@node-rs/argon2";
import { convertSessionCookieMaxAgeToMsInPlace } from "@/session/sessionServices";

async function createPasswordResetTokenService(userId: string, db: DB) {
  const tokenId = await db.transaction(async (tx) => {
    await deleteResetPasswordTokensByUserId(userId, db);
    const tokenId = generateIdFromEntropySize(25);
    const tokenHash = encodeHex(
      await sha256(new TextEncoder().encode(tokenId)),
    );
    await insertResetPasswordToken(
      {
        tokenHash: tokenHash,
        userId: userId,
        expiresAt: createDate(new TimeSpan(2, "h")),
      },
      db,
    );
    return tokenId;
  });
  return tokenId;
}
export async function sendResetTokenService(email: string, db: DB) {
  await db.transaction(async (tx) => {
    const user = await getUserByEmailService(email, db);
    if (!user) {
      throw new AppError(400, "Invalid email");
    }
    const verificationToken = await createPasswordResetTokenService(
      user.id,
      tx,
    );
    const verificationLink = `${config.server.basePath}/v1/reset-password/${verificationToken}`;
    await sendResetToken(email, verificationLink);
  });
}

export async function resetPasswordService(
  verificationToken: string,
  password: string,
  db: DB,
) {
  const sessionCookie = await db.transaction(async (tx) => {
    const tokenHash = encodeHex(
      await sha256(new TextEncoder().encode(verificationToken)),
    );
    const token = await getResetPasswordTokenByTokenHash(tokenHash, tx);
    if (token) {
      await deleteResetPasswordTokenByTokenHash(tokenHash, tx);
    }

    if (!token || !isWithinExpirationDate(token.expiresAt)) {
      throw new AppError(400, "Invalid token");
    }

    await lucia.invalidateUserSessions(token.userId);
    const passwordHash = await hash(password, hashConfig);
    await updateUserPasswordService(token.userId, passwordHash, tx);

    const session = await lucia.createSession(token.userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    convertSessionCookieMaxAgeToMsInPlace(sessionCookie);
    return sessionCookie;
  });
  return sessionCookie;
}
