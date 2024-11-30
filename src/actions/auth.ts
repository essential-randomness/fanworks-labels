import { ActionError, defineAction } from "astro:actions";
import { z } from "astro:schema";
import { createClient } from "../auth/client";
import { nanoid } from "nanoid";
import { deleteSessionTokenCookie, validateSessionToken } from "../auth/session";

export const authorize = defineAction({
  accept: "form",
  input: z.object({
    handle: z.string(),
  }),
  handler: async (input) => {
    const handle = input.handle;
    const oauthClient = await createClient();
    const state = nanoid();
    const url = await oauthClient.authorize(handle, {
      scope: "atproto transition:generic",
      state,
    });
    return {redirectTo: url};
  },
});

export const logout = defineAction({
    accept: "form",
  input: z.object({}),
  handler: async (_, ctx) => {
    const sessionToken = ctx.cookies.get("session")?.value;
    if (!sessionToken) {
        throw new ActionError({
            code: "BAD_REQUEST",
            message: "Tried to logout without a session",
          });
    }
    const {session} = await validateSessionToken(sessionToken);
    if (!session) {
        throw new ActionError({
            code: "BAD_REQUEST",
            message: "Tried to logout without a BSky session",
          });
    }
    const oauthClient = await createClient();
    oauthClient.revoke(session.userDid)
    deleteSessionTokenCookie(ctx.cookies);
    return "logged out";
  },
});
