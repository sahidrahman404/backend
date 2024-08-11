import type { DB } from "@/db/dbServices";
import { generateIdFromEntropySize } from "lucia";
import {
  getUserByEmail,
  getUserByGoogleId,
  getUserById,
  getUsersStats,
  getUsersCount,
  increaseUserLoggedInCount,
  insertUser,
  updateLastLoggedOutAt,
  updateUserEmailVerified,
  updateUserName,
  getUserFacebookId,
  updateUserPassword,
} from "@/user/userRepositories";
import { generateEmailVerificationTokenService } from "@/email-verification-token/emailVerificationTokenServices";
import { hash, verify } from "@node-rs/argon2";
import { hashConfig, lucia } from "@/lucia/luciaServices";
import { sendVerificationCode } from "@/email-verification-token/emailVerification";
import { config } from "@/config";
import type { Token } from "@/email-verification-token/emailVerificationTokenRepositories";
import AppError from "@/error/appError";
import { convertSessionCookieMaxAgeToMsInPlace } from "@/session/sessionServices";
import type {
  FacebookUserProfile,
  GoogleUserProfile,
} from "@/oauth/oauthSchemas";

export async function createUserService(
  email: string,
  name: string,
  password: string,
  db: DB,
) {
  const sessionCookie = await db.transaction(async (tx) => {
    const userId = generateIdFromEntropySize(10);
    const passwordHash = await hash(password, hashConfig);
    try {
      await insertUser(
        {
          id: userId,
          name,
          email,
          passwordHash: passwordHash,
          emailVerified: false,
          createdAt: new Date(Date.now()),
        },
        db,
      );
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "UNIQUE constraint failed: users.email"
      ) {
        throw new AppError(409, "Email Address Already Registered");
      }
    }

    const verificationToken = await generateEmailVerificationTokenService(
      userId,
      email,
      db,
    );
    const verificationLink = `${config.server.basePath}/v1/email-verification/${verificationToken}`;
    await sendVerificationCode(email, verificationLink);

    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    convertSessionCookieMaxAgeToMsInPlace(sessionCookie);
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
    convertSessionCookieMaxAgeToMsInPlace(sessionCookie);
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
    await increaseUserLoggedInCount(user.id, tx);
    convertSessionCookieMaxAgeToMsInPlace(sessionCookie);
    return sessionCookie;
  });
  return sessionCookie;
}

export async function createGoogleUser(googleUser: GoogleUserProfile, db: DB) {
  const sessionCookie = await db.transaction(async (tx) => {
    const existingUser = await getUserByGoogleId(googleUser.id, tx);
    if (existingUser) {
      const session = await lucia.createSession(existingUser.id, {});
      const sessionCookie = lucia.createSessionCookie(session.id);
      await increaseUserLoggedInCount(existingUser.id, tx);
      return sessionCookie;
    }
    const userId = generateIdFromEntropySize(10);

    await insertUser(
      {
        id: userId,
        name: googleUser.name,
        googleId: googleUser.id,
        email: googleUser.email,
        emailVerified: true,
        createdAt: new Date(Date.now()),
      },
      tx,
    );

    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    return sessionCookie;
  });
  convertSessionCookieMaxAgeToMsInPlace(sessionCookie);
  return sessionCookie;
}

export async function createFacebookUser(
  facebookUser: FacebookUserProfile,
  db: DB,
) {
  const sessionCookie = await db.transaction(async (tx) => {
    const existingUser = await getUserFacebookId(facebookUser.id, tx);
    if (existingUser) {
      const session = await lucia.createSession(existingUser.id, {});
      const sessionCookie = lucia.createSessionCookie(session.id);
      await increaseUserLoggedInCount(existingUser.id, tx);
      return sessionCookie;
    }
    const userId = generateIdFromEntropySize(10);

    await insertUser(
      {
        id: userId,
        name: facebookUser.name,
        facebookId: facebookUser.id,
        email: facebookUser.email,
        emailVerified: true,
        createdAt: new Date(Date.now()),
      },
      tx,
    );

    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    return sessionCookie;
  });
  convertSessionCookieMaxAgeToMsInPlace(sessionCookie);
  return sessionCookie;
}

export async function signUserOut(
  session: Express.Locals["session"],
  user: Express.Locals["user"],
  db: DB,
) {
  if (!session || !user) {
    throw new AppError(400, "Unauthorized");
  }
  const sessionCookie = await db.transaction(async (tx) => {
    await lucia.invalidateSession(session.id);

    const sessionCookie = lucia.createBlankSessionCookie();
    await updateLastLoggedOutAt(user.id, db);
    return sessionCookie;
  });
  return sessionCookie;
}

export async function getUserStatsService(db: DB) {
  return getUsersStats(db);
}

export async function getUsersCountService(db: DB) {
  return await getUsersCount(db);
}

export async function updateUserNameService(
  userId: string,
  name: string,
  db: DB,
) {
  await updateUserName(userId, name, db);
}

export async function resetPassword(
  oldPassword: string,
  newPassword: string,
  userId: string,
  db: DB,
) {
  const sessionCookie = await db.transaction(async (tx) => {
    const user = await getUserById(userId, tx);
    if (!user) {
      throw new AppError(400, "Bad Auth");
    }
    if (!user.passwordHash) {
      throw new AppError(400, "Bad Auth");
    }
    const validOldPassword = await verify(
      user.passwordHash,
      oldPassword,
      hashConfig,
    );
    if (!validOldPassword) {
      throw new AppError(400, "Invalid old password");
    }
    const passwordHash = await hash(newPassword, hashConfig);
    await updateUserPassword(userId, passwordHash, tx);
    const session = await lucia.createSession(user.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    convertSessionCookieMaxAgeToMsInPlace(sessionCookie);
    return sessionCookie;
  });
  return sessionCookie;
}
