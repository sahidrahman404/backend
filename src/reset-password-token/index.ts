import express from "express";
import { validateData } from "@/middleware/middlewareServices";
import {
  type ResetPassword,
  resetPasswordSchema,
  type ResetPasswordToken,
  resetPasswordTokenSchema,
} from "@/reset-password-token/resetPasswordTokenSchemas";
import {
  resetPasswordService,
  sendResetTokenService,
} from "@/reset-password-token/resetPasswordTokenServices";
import AppError from "@/error/appError";

const passwordResetRouter = express();
const resetPassword = express.Router();

passwordResetRouter.post(
  "/",
  validateData(resetPasswordTokenSchema),
  async (req, res, next) => {
    try {
      const { email } = req.body as ResetPasswordToken;
      await sendResetTokenService(email, req.db);
      res.status(200).json({ success: true });
    } catch (err) {
      next(err);
    }
  },
);

resetPassword.post(
  "/:token",
  validateData(resetPasswordSchema),
  async (req, res, next) => {
    try {
      const verificationToken = req.params.token;
      if (!verificationToken) {
        throw new AppError(400, "Invalid Token");
      }
      const { password } = req.body as ResetPassword;
      const sessionCookie = await resetPasswordService(
        verificationToken,
        password,
        req.db,
      );
      res
        .status(302)
        .set({
          Location: "/",
          "Set-Cookie": sessionCookie.serialize(),
          "Referrer-Policy": "strict-origin",
        })
        .redirect("");
    } catch (err) {
      next(err);
    }
  },
);

passwordResetRouter.use("/email-verification", resetPassword);

export default passwordResetRouter;
