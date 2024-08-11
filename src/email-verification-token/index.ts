import express from "express";
import {
  resendEmailVerificationTokenService,
  verifyTokenService,
} from "@/email-verification-token/emailVerificationTokenServices";
import { updateEmailVerifiedService } from "@/user/userServices";
import { config } from "@/config";
import AppError from "@/error/appError";

const emailVerificationRouter = express();
const emailVerification = express.Router();

emailVerification.get("/:token", async (req, res, next) => {
  try {
    const verificationToken = req.params.token;
    const token = await verifyTokenService(verificationToken, req.db);
    const sessionCookie = await updateEmailVerifiedService(token, req.db);
    res
      .status(302)
      .cookie(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
      .redirect(config.frontend.basePath);
  } catch (err) {
    next(err);
  }
});

emailVerification.get("/", async (req, res, next) => {
  try {
    const user = res.locals.user;
    if (!user) {
      throw new AppError(400, "Unauthorized");
    }
    await resendEmailVerificationTokenService(user.id, user.email, req.db);
    res.status(200).json({
      success: true,
    });
  } catch (err) {
    next(err);
  }
});

emailVerificationRouter.use("/email-verification", emailVerification);

export default emailVerificationRouter;
