import type {
  NodeSavedSession,
  NodeSavedSessionStore,
  NodeSavedState,
  NodeSavedStateStore,
} from "@atproto/oauth-client-node";
import { db, BskyAuthState, BskyAuthSession, eq } from "astro:db";

export class StateStore implements NodeSavedStateStore {
  async get(key: string): Promise<NodeSavedState | undefined> {
    const result = await db
      .select()
      .from(BskyAuthState)
      .where(eq(BskyAuthState.key, key))
      .limit(1);
    if (!result?.length) return;
    return JSON.parse(result[0].state) as NodeSavedState;
  }
  async set(key: string, val: NodeSavedState) {
    const state = JSON.stringify(val);
    await db.insert(BskyAuthState).values({ key, state }).onConflictDoUpdate({
      target: BskyAuthState.key,
      set: { state },
    });
  }
  async del(key: string) {
    await db.delete(BskyAuthState).where(eq(BskyAuthState.key, key));
  }
}

export class SessionStore implements NodeSavedSessionStore {
  async get(key: string): Promise<NodeSavedSession | undefined> {
    const result = await db
      .select()
      .from(BskyAuthSession)
      .where(eq(BskyAuthSession.key, key))
      .limit(1);
    if (!result?.length) return;
    return JSON.parse(result[0].session) as NodeSavedSession;
  }
  async set(key: string, val: NodeSavedSession) {
    const session = JSON.stringify(val);
    await db.insert(BskyAuthSession).values({ key, session }).onConflictDoUpdate({
      target: BskyAuthSession.key,
      set: { session },
    });
  }
  async del(key: string) {
    await db.delete(BskyAuthSession).where(eq(BskyAuthSession.key, key));
  }
}
