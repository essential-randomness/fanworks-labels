import type { APIRoute } from "astro";
import { createClient } from "../../auth/client";
import { SessionStore } from "../../auth/storage";
import { Agent } from "@atproto/api";
import { nanoid } from "nanoid";

export const GET: APIRoute = async ({ request, cookies }) => {
  const oauthClient = await createClient();
  const url = new URL(request.url);
  const { session } = await oauthClient.callback(url.searchParams);

  const agent = new Agent(session);
  const profile = await agent.getProfile({ actor: agent.did! });
  console.log("Bsky profile:", profile.data);

  const sid = nanoid();
  await new SessionStore().set(sid, session as any);
  cookies.set("sid", sid, {
    httpOnly: true,
    sameSite: "strict",
    secure: true,
    maxAge: 900000,
  });
  console.log(...cookies.headers());

  console.log(sid);
  return new Response(null, {
    status: 302,
    headers: {
      Location: "/",
      "Set-Cookie": `sid=${sid}; Max-Age=900000; HttpOnly; Secure; SameSite=Strict`,
    },
  });
};
