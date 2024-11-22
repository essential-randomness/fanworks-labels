import type {
  NodeSavedSession,
  NodeSavedSessionStore,
  NodeSavedState,
  NodeSavedStateStore,
} from "@atproto/oauth-client-node";
import { db, AuthState, AuthSession, eq } from "astro:db";

export class StateStore implements NodeSavedStateStore {
  async get(key: string): Promise<NodeSavedState | undefined> {
    const result = await db
      .select()
      .from(AuthState)
      .where(eq(AuthState.key, key))
      .limit(1);
    if (!result?.length) return;
    return JSON.parse(result[0].state) as NodeSavedState;
  }
  async set(key: string, val: NodeSavedState) {
    const state = JSON.stringify(val);
    await db.insert(AuthState).values({ key, state }).onConflictDoUpdate({
      target: AuthState.key,
      set: { state },
    });
  }
  async del(key: string) {
    await db.delete(AuthState).where(eq(AuthState.key, key));
  }
}

export class SessionStore implements NodeSavedSessionStore {
  async get(key: string): Promise<NodeSavedSession | undefined> {
    const result = await db
      .select()
      .from(AuthSession)
      .where(eq(AuthSession.key, key))
      .limit(1);
    if (!result?.length) return;
    return JSON.parse(result[0].session) as NodeSavedSession;
  }
  async set(key: string, val: NodeSavedSession) {
    const session = JSON.stringify(val);
    await db.insert(AuthSession).values({ key, session }).onConflictDoUpdate({
      target: AuthSession.key,
      set: { session },
    });
  }
  async del(key: string) {
    await db.delete(AuthSession).where(eq(AuthSession.key, key));
  }
}
