import { createClient } from "../auth/client";

const oauthClient = await createClient();

export async function GET(): Promise<Response> {
  const response = new Response(JSON.stringify(oauthClient.jwks));
  response.headers.set("Content-Type", "application/json");
  return response;
}
// essentialrandom.bsky.social;
