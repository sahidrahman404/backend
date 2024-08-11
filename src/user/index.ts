import express from "express";
import { validateData } from "@/middleware/middlewareServices";
import {
  type UpdateUserName,
  updateUserNameSchema,
  type UserLogin,
  userLoginSchema,
  type UserRegistration,
  userRegistrationSchema,
} from "@/user/userSchemas";
import {
  createUserService,
  getUserStatsService,
  signUserOut,
  updateUserNameService,
  verifyUserService,
} from "@/user/userServices";
import AppError from "@/error/appError";
import { config } from "@/config";

const userRouter = express();
const user = express.Router();

user.post(
  "/signup",
  validateData(userRegistrationSchema),
  async (req, res, next) => {
    try {
      const { name, password, email } = req.body as UserRegistration;
      const sessionCookie = await createUserService(
        email,
        name,
        password,
        req.db,
      );
      res
        .status(200)
        .cookie(
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes,
        )
        .json({
          sucess: true,
          sessionCookie: sessionCookie,
        });
    } catch (err) {
      next(err);
    }
  },
);

user.post("/signin", validateData(userLoginSchema), async (req, res, next) => {
  try {
    const { password, email } = req.body as UserLogin;
    const sessionCookie = await verifyUserService(email, password, req.db);
    res
      .status(200)
      .cookie(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
      .json({
        sucess: true,
        sessionCookie: sessionCookie,
      });
  } catch (err) {
    next(err);
  }
});

user.get("/signout", async (req, res, next) => {
  try {
    const session = res.locals.session;
    const user = res.locals.user;
    if (!session) {
      throw new AppError(400, "Unauthorized");
    }

    const sessionCookie = await signUserOut(session, user, req.db);
    res.status(302);
    res.cookie(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );
    res.redirect(`${config.frontend.basePath}/signin`);
  } catch (err) {
    next(err);
  }
});

user.get("/stats", async (req, res, next) => {
  try {
    const user = res.locals.user;
    if (!user) {
      throw new AppError(400, "Unauthorized");
    }

    const userStats = await getUserStatsService(req.db);
    res.status(200).json({
      success: true,
      data: userStats,
    });
  } catch (err) {
    next(err);
  }
});

user.get("/", async (req, res, next) => {
  try {
    if (!res.locals.user) {
      throw new AppError(401, "You are not authorized to access this resource");
    }
    res.status(200).json({
      success: true,
      data: res.locals.user,
    });
  } catch (err) {
    next(err);
  }
});

user.post(
  "/update-name",
  validateData(updateUserNameSchema),
  async (req, res, next) => {
    try {
      if (!res.locals.user) {
        throw new AppError(
          401,
          "You are not authorized to access this resource",
        );
      }
      const { name } = req.body as UpdateUserName;
      await updateUserNameService(res.locals.user.id, name, req.db);
      res.status(200).json({
        success: true,
      });
    } catch (err) {
      next(err);
    }
  },
);

userRouter.use("/users", user);

export default userRouter;
