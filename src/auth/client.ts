import { NodeOAuthClient } from "@atproto/oauth-client-node";
import { db as database } from "astro:db";
import { PORT, PUBLIC_URL } from "astro:env/server";
import { SessionStore, StateStore } from "./storage.ts";
import { JoseKey } from "@atproto/jwk-jose";

export const createClient = async () => {
  const publicUrl = PUBLIC_URL;
  const url = publicUrl || `http://localhost:${PORT}`;
  const enc = encodeURIComponent;
  return new NodeOAuthClient({
    clientMetadata: {
      client_name: "Fanworks Labels",
      client_id: publicUrl
        ? `${url}/client-metadata.json`
        : `http://localhost?redirect_uri=${enc(`${url}/oauth/callback`)}&scope=${enc("atproto transition:generic")}`,
      client_uri: url,
      redirect_uris: [`${url}/oauth/callback`],
      scope: "atproto transition:generic",
      grant_types: ["authorization_code", "refresh_token"],
      response_types: ["code"],
      application_type: "web",
      token_endpoint_auth_method: "none",
      dpop_bound_access_tokens: true,
      jwks_uri: `${url}/jwks.json`,
    },
    keyset: await Promise.all([JoseKey.generate()]),
    stateStore: new StateStore(),
    sessionStore: new SessionStore(),
  });
};
