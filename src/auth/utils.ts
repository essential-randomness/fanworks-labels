import type { AstroCookies } from "astro";
import { AuthSession, db, eq } from "astro:db";
import { createClient } from "../auth/client";
import { Agent } from "@atproto/api";

export const getUserDid = async (cookies: AstroCookies) => {
  const sid = cookies.get("sid");
  if (sid) {
    const sessionState = await db
      .select()
      .from(AuthSession)
      .where(eq(AuthSession.key, sid.value))
      .limit(1);
    return JSON.parse(sessionState[0].session).did ?? null;
  }
  return null;
};

export const getBskyAgent = async ({ did }: { did: string }) => {
  const oauthClient = await createClient();
  const session = await oauthClient.restore(did);
  if (session) {
    return new Agent(session);
  }
  return null;
};
