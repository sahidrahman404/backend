import {
  generateCodeVerifier,
  generateState,
  OAuth2RequestError,
} from "arctic";
import { facebook, google } from "@/lucia/luciaServices";
import type { DB } from "@/db/dbServices";
import AppError from "@/error/appError";
import type {
  FacebookUserProfile,
  GoogleUserProfile,
} from "@/oauth/oauthSchemas";
import { createFacebookUser, createGoogleUser } from "@/user/userServices";

export async function generateGoogleAuthObject() {
  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  const authUrl = await google.createAuthorizationURL(state, codeVerifier, {
    scopes: ["email", "profile"],
  });
  return {
    state,
    codeVerifier,
    authUrl,
  };
}

export async function generateFacebookAuthObject() {
  const state = generateState();
  const authUrl = await facebook.createAuthorizationURL(state, {
    scopes: ["email", "public_profile"],
  });
  return {
    state,
    authUrl,
  };
}

export async function signUserInByGoogle(
  code: string,
  codeVerifier: string,
  db: DB,
) {
  try {
    const tokens = await google.validateAuthorizationCode(code, codeVerifier);
    const googleUserResponse = await fetch(
      `https://www.googleapis.com/oauth2/v1/userinfo`,
      {
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      },
    );

    const googleUser = (await googleUserResponse.json()) as GoogleUserProfile;
    const sessionCookie = createGoogleUser(googleUser, db);
    return sessionCookie;
  } catch (err) {
    if (err instanceof OAuth2RequestError) {
      throw new AppError(400, "Invalid Code");
    }
    throw new AppError(500, "Internal Server Error");
  }
}

export async function signUserInByFacebook(code: string, db: DB) {
  try {
    const tokens = await facebook.validateAuthorizationCode(code);
    const facebookUserResponse = await fetch(
      `https://graph.facebook.com/me?access_token=${tokens.accessToken}&fields=id,name,email`,
    );

    const facebookUser =
      (await facebookUserResponse.json()) as FacebookUserProfile;
    const sessionCookie = createFacebookUser(facebookUser, db);
    return sessionCookie;
  } catch (err) {
    if (err instanceof OAuth2RequestError) {
      throw new AppError(400, "Invalid Code");
    }
    throw new AppError(500, "Internal Server Error");
  }
}
