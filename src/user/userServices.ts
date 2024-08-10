import type { DB } from "@/db/dbServices";
import { generateIdFromEntropySize } from "lucia";
import {
  getUserByEmail,
  getUserById,
  insertUser,
  updateUserEmailVerified,
  updateUserPassword,
} from "@/user/userRepositories";
import { generateEmailVerificationTokenService } from "@/email-verification-token/emailVerificationTokenServices";
import { hash, verify } from "@node-rs/argon2";
import { hashConfig, lucia } from "@/lucia/luciaServices";
import { sendVerificationCode } from "@/email-verification-token/emailVerification";
import { config } from "@/config";
import type { Token } from "@/email-verification-token/emailVerificationTokenRepositories";
import AppError from "@/error/appError";

export async function createUserService(
  email: string,
  name: string,
  password: string,
  db: DB,
) {
  const sessionCookie = await db.transaction(async (tx) => {
    const userId = generateIdFromEntropySize(10);
    const passwordHash = await hash(password, hashConfig);
    await insertUser(
      {
        id: userId,
        name,
        email,
        passwordHash: passwordHash,
        emailVerified: false,
      },
      db,
    );

    const verificationToken = await generateEmailVerificationTokenService(
      userId,
      email,
      db,
    );
    const verificationLink = `${config.server.basePath}/v1/email-verification/${verificationToken}`;
    await sendVerificationCode(email, verificationLink);

    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    return sessionCookie;
  });
  return sessionCookie;
}

export async function updateEmailVerifiedService(token: Token, db: DB) {
  const sessionCookie = await db.transaction(async (tx) => {
    const user = await getUserById(token.userId, db);
    if (!user || user.email !== token.email) {
      throw new AppError(401, "You are not authorized to access this resource");
    }
    await lucia.invalidateUserSessions(user.id);
    await updateUserEmailVerified(user.id, true, db);
    const session = await lucia.createSession(user.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    return sessionCookie;
  });
  return sessionCookie;
}

export async function verifyUserService(
  email: string,
  password: string,
  db: DB,
) {
  const sessionCookie = await db.transaction(async (tx) => {
    const user = await getUserByEmail(email, tx);
    if (!user) {
      throw new AppError(400, "Invalid email or password");
    }
    if (!user.passwordHash) {
      throw new AppError(400, "Invalid email or password");
    }
    const validPassword = await verify(user.passwordHash, password, hashConfig);
    if (!validPassword) {
      throw new AppError(400, "Invalid email or password");
    }
    const session = await lucia.createSession(user.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    return sessionCookie;
  });
  return sessionCookie;
}

export async function getUserByEmailService(email: string, db: DB) {
  return await getUserByEmail(email, db);
}

export async function updateUserPasswordService(
  userId: string,
  passwordHash: string,
  db: DB,
) {
  await updateUserPassword(userId, passwordHash, db);
}
