import { NodeOAuthClient } from "@atproto/oauth-client-node";
import { PORT, PUBLIC_URL } from "astro:env/server";
import { SessionStore, StateStore } from "./storage.ts";
import { JoseKey } from "@atproto/jwk-jose";
import { Agent } from "@atproto/api";

const ALLOWED_SCOPES = "atproto transition:generic";
const REDIRECT_PATH = "/oauth/callback";

// In local clients configuration for allowed scopes and redirects
// is done through search params
// See: https://atproto.com/specs/oauth#clients
const LOCAL_SEARCH_PARAMS = new URLSearchParams({
  scope: ALLOWED_SCOPES,
  redirect_uri: new URL(REDIRECT_PATH, PUBLIC_URL).toString(),
});
const IS_DEVELOPMENT = process.env.NODE_ENV == "development";

const createClient = async () => {
  if (!PUBLIC_URL) {
    throw new Error("PUBLIC_URL is not set but is required for oauth.");
  }

  return new NodeOAuthClient({
    clientMetadata: {
      client_name: "Fanworks Labels",
      client_id: IS_DEVELOPMENT
        ? `http://localhost?${LOCAL_SEARCH_PARAMS.toString()}`
        : new URL("/client-metadata.json", PUBLIC_URL).toString(),
      client_uri: PUBLIC_URL,
      redirect_uris: [new URL(REDIRECT_PATH, PUBLIC_URL).toString()],
      scope: ALLOWED_SCOPES,
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
