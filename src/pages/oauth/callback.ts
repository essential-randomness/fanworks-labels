import type { APIRoute } from "astro";
import { createClient } from "../../auth/client";
import { SessionStore } from "../../auth/storage";
import { Agent } from "@atproto/api";
import { nanoid } from "nanoid";
import { AuthSession, db } from "astro:db";

export const GET: APIRoute = async ({ request, cookies }) => {
  const oauthClient = await createClient();
  const url = new URL(request.url);
  const { session } = await oauthClient.callback(url.searchParams);

  const agent = new Agent(session);

  const sid = nanoid();
  await db.insert(AuthSession).values({
    key: sid,
    session: JSON.stringify({did: agent.did!}),
  });

  return new Response(null, {
    status: 302,
    headers: {
      Location: "/",
      "Set-Cookie": `sid=${sid}; Max-Age=900000; HttpOnly; Secure; SameSite=Lax; Path=/`,
    },
  });
};
