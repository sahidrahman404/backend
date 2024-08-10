import express from "express";
import { appError, validateData } from "@/middleware/middlewareServices";
import {
  type UserLogin,
  userLoginSchema,
  type UserRegistration,
  userRegistrationSchema,
} from "@/user/userSchemas";
import { createUserService, verifyUserService } from "@/user/userServices";
import AppError from "@/error/appError";

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
        .status(302)
        .set({
          Location: "/",
          "Set-Cookie": sessionCookie.serialize(),
        })
        .redirect("");
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
      .status(302)
      .set({
        Location: "/",
        "Set-Cookie": sessionCookie.serialize(),
      })
      .redirect("");
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

userRouter.use("/users", user);

export default userRouter;
