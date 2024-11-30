import type { APIRoute } from "astro";
import { createClient } from "../../auth/client";
import { Agent } from "@atproto/api";
import { generateSessionToken, createSession } from "../../auth/session.js";


export const GET: APIRoute = async ({ request, cookies }) => {
  const oauthClient = await createClient();
  const url = new URL(request.url);
  const { session: oauthSession } = await oauthClient.callback(url.searchParams);

  const agent = new Agent(oauthSession);


  const token = generateSessionToken();
  const session = await createSession(token, agent.did!);
  // setSessionTokenCookie(token);

  cookies.set("session", token, {
		httpOnly: true,
		sameSite: "lax",
		secure: import.meta.env.PROD,
		expires: session.expiresAt,
		path: "/"
	});
  return new Response(null, {
    status: 302,
    headers: {
      Location: "/",
      // "Set-Cookie": `sid=${session.id}; Max-Age=900000; HttpOnly; Secure; SameSite=Lax; Path=/`,
    },
  });
};
