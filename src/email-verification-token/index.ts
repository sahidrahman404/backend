import express from "express";
import { verifyTokenService } from "@/email-verification-token/emailVerificationTokenServices";
import { updateEmailVerifiedService } from "@/user/userServices";

const emailVerificationRouter = express();
const emailVerification = express.Router();

emailVerification.get("/:token", async (req, res, next) => {
  try {
    const verificationToken = req.params.token;
    const token = await verifyTokenService(verificationToken, req.db);
    const sessionCookie = await updateEmailVerifiedService(token, req.db);
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
});

emailVerificationRouter.use("/email-verification", emailVerification);

export default emailVerificationRouter;
