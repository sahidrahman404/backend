import type { DB } from "@/db/dbServices";
import type { Session, User } from "lucia";

export {};

declare global {
  namespace Express {
    interface Request {
      db: DB;
    }
    interface Locals {
      user:
        | (User & {
            email: string;
            emailVerified: boolean;
            createdAt: Date;
          })
        | null;
      session: Session | null;
    }
  }
}
