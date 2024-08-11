import express from "express";
import {
  generateFacebookAuthObject,
  generateGoogleAuthObject,
  signUserInByFacebook,
  signUserInByGoogle,
} from "@/oauth/oauthServices";
import AppError from "@/error/appError";
import { config } from "@/config";

const oauthRouter = express();
const oauth = express.Router();

oauth.get("/google", async (req, res, next) => {
  try {
    const { authUrl, codeVerifier, state } = await generateGoogleAuthObject();
    res.status(302);

    res.cookie("google_oauth_state", state, {
      path: "/",
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 60 * 10 * 1000,
      sameSite: "lax",
    });

    res.cookie("google_oauth_code_verifier", codeVerifier, {
      path: "/",
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 60 * 10 * 1000,
      sameSite: "lax",
    });

    res.redirect(authUrl.toString());
  } catch (err) {
    next(err);
  }
});

oauth.get("/google/callback", async (req, res, next) => {
  try {
    const { state, code } = req.query;
    const storedState = req.cookies["google_oauth_state"] ?? null;
    const codeVerifier = req.cookies["google_oauth_code_verifier"] ?? null;
    if (
      !code ||
      !state ||
      !storedState ||
      !codeVerifier ||
      state !== storedState
    ) {
      throw new AppError(400, "Bad auth");
    }
    const sessionCookie = await signUserInByGoogle(
      code as string,
      codeVerifier,
      req.db,
    );
    res
      .status(302)
      .cookie(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
      .redirect(config.frontend.basePath);
  } catch (err) {
    next(err);
  }
});

oauth.get("/facebook", async (req, res, next) => {
  try {
    const { authUrl, state } = await generateFacebookAuthObject();
    res.status(302);

    res.cookie("facebook_oauth_state", state, {
      path: "/",
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 60 * 10 * 1000,
      sameSite: "lax",
    });

    res.redirect(authUrl.toString());
  } catch (err) {
    next(err);
  }
});

oauth.get("/facebook/callback", async (req, res, next) => {
  try {
    const { code } = req.query;
    if (!code) {
      throw new AppError(400, "Bad auth");
    }
    const sessionCookie = await signUserInByFacebook(code as string, req.db);
    res
      .status(302)
      .cookie(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
      .redirect(config.frontend.basePath);
  } catch (err) {
    next(err);
  }
});

oauthRouter.use("/oauth", oauth);

export default oauthRouter;
