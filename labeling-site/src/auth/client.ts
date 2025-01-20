import { NodeOAuthClient } from "@atproto/oauth-client-node";
import { PORT, PUBLIC_URL } from "astro:env/server";
import { SessionStore, StateStore } from "./storage.ts";
import { JoseKey } from "@atproto/jwk-jose";
import { Agent } from "@atproto/api";

const createClient = async () => {
  if (!PUBLIC_URL) {
    throw new Error("PUBLIC_URL is not set but is required for oauth.");
  }
  // TODO: make local OAuth work
  // https://atproto.com/specs/oauth#clients
  return new NodeOAuthClient({
    clientMetadata: {
      client_name: "Fanworks Labels",
      client_id: new URL("/client-metadata.json", PUBLIC_URL).toString(),
      client_uri: PUBLIC_URL,
      redirect_uris: [new URL("/oauth/callback", PUBLIC_URL).toString()],
      scope: "atproto transition:generic",
      grant_types: ["authorization_code", "refresh_token"],
      response_types: ["code"],
      application_type: "web",
      token_endpoint_auth_method: "none",
      dpop_bound_access_tokens: true,
      jwks_uri: new URL("/jwks.json", PUBLIC_URL).toString(),
    },
    keyset: await Promise.all([JoseKey.generate()]),
    stateStore: new StateStore(),
    sessionStore: new SessionStore(),
  });
};
export const oauthClient = await createClient();

export const getBskyAgent = async ({ did }: { did: string }) => {
  const session = await oauthClient.restore(did);
  if (session) {
    return new Agent(session);
  }
  return null;
};
