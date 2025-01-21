import { oauthClient } from "./auth/client";
import {
  deleteSessionTokenCookie,
  setSessionTokenCookie,
  validateSessionToken,
} from "./auth/session";
import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware(async (context, next) => {
  const token = context.cookies.get("session")?.value ?? null;
  if (token === null) {
    context.locals.session = null;
    return next();
  }

  const { session } = await validateSessionToken(token);
  if (session == null) {
    deleteSessionTokenCookie(context.cookies);
    return next();
  }
  // Check that the BlueSky session is valid
  try {
    await oauthClient.restore(session.userDid);
  } catch (e) {
    // The session is valid but the oauthToken for BSky has expired.
    deleteSessionTokenCookie(context.cookies);
    return next();
  }
  setSessionTokenCookie(context.cookies, token, session.expiresAt);

  context.locals.session = session;
  return next();
});
