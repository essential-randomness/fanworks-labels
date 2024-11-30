import type { AstroCookies } from "astro";
import { AuthSession, db, eq } from "astro:db";
import { createClient } from "../auth/client";
import { Agent } from "@atproto/api";

export const getBskyAgent = async ({ did }: { did: string }) => {
  const oauthClient = await createClient();
  const session = await oauthClient.restore(did);
  if (session) {
    return new Agent(session);
  }
  return null;
};
