import { oauthClient } from "../auth/client";

export async function GET(): Promise<Response> {
  const response = new Response(JSON.stringify(oauthClient.clientMetadata));
  response.headers.set("Content-Type", "application/json");
  return response;
}
