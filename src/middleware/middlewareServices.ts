import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import { z, ZodError } from "zod";
import { StatusCodes } from "http-status-codes";
import AppError from "@/error/appError";
import { db } from "@/db/dbServices";
import { lucia } from "@/lucia/luciaServices";
import type { User } from "lucia";
import { convertSessionCookieMaxAgeToMsInPlace } from "@/session/sessionServices";

export function validateData(schema: z.ZodObject<any, any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map((issue: any) => ({
          message: `${issue.path.join(".")} is ${issue.message}`,
        }));
        res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          msg: "Invalid data",
          details: errorMessages,
        });
      } else {
        res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ success: false, msg: "Internal Server Error" });
      }
    }
  };
}

export function appError(
  err: Error,
  _: express.Request,
  res: express.Response,
  next: express.NextFunction,
) {
  if (err instanceof AppError) {
    if (!err.isOperational) {
      // gracefully shut down app if it's not an AppError
    }
    res.status(err.statusCode).json({ success: false, msg: err.message });
  }
  next();
}

export async function injectDatabase(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) {
  try {
    req.db = db;
    next();
  } catch (err) {
    console.error("Error connecting to database:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function validateRequest(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) {
  const sessionId = lucia.readSessionCookie(req.headers.cookie ?? "");
  if (!sessionId) {
    res.locals.user = null;
    res.locals.session = null;
    return next();
  }

  const { session, user } = await lucia.validateSession(sessionId);
  if (session && session.fresh) {
    const sessionCookie = lucia.createSessionCookie(session.id);
    convertSessionCookieMaxAgeToMsInPlace(sessionCookie);
    res.appendHeader("Set-Cookie", sessionCookie.serialize());
  }
  if (!session) {
    res.appendHeader(
      "Set-Cookie",
      lucia.createBlankSessionCookie().serialize(),
    );
  }
  res.locals.user = user as User & {
    name: string;
    googleId: string | null;
    facebookId: string | null;
    email: string;
    emailVerified: boolean;
    createdAt: Date;
  };
  res.locals.session = session;
  return next();
}
