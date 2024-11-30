import { AuthSession, eq, db } from "astro:db";
import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";
import type { AstroCookies } from "astro";

const DAYS_IN_MS = 1000 * 60 * 60 * 24;
const SESSION_DURATION_DAYS = 30;
const RENEWAL_THRESHOLD_DAYS = 15;

export type AuthSessionType = typeof AuthSession.$inferSelect;

export function generateSessionToken(): string {
	const bytes = new Uint8Array(20);
	crypto.getRandomValues(bytes);
	const token = encodeBase32LowerCaseNoPadding(bytes);
	return token;
}

export async function createSession(token: string, userDid: string): Promise<AuthSessionType> {
    const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
    const session = {
		id: sessionId,
		userDid,
		expiresAt: new Date(Date.now() + DAYS_IN_MS * SESSION_DURATION_DAYS)
	}
	await db.insert(AuthSession).values(session);
	return session;
    
	// TODO
}

export async function validateSessionToken(token: string): Promise<SessionValidationResult> {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const result = await db
		.select()
		.from(AuthSession)
		.where(eq(AuthSession.id, sessionId));
	if (result.length < 1) {
		return { session: null };
	}
	const session = result[0];
	if (Date.now() >= session.expiresAt.getTime()) {
		await invalidateSession(sessionId);
		return { session: null };
	}
	if (Date.now() >= session.expiresAt.getTime() - DAYS_IN_MS * RENEWAL_THRESHOLD_DAYS) {
		session.expiresAt = new Date(Date.now() + DAYS_IN_MS * SESSION_DURATION_DAYS);
		await db
			.update(AuthSession)
			.set({
				expiresAt: session.expiresAt
			})
			.where(eq(AuthSession.id, session.id));
	}
	return { session };
}

export async function invalidateSession(sessionId: string): Promise<void> {
    await db.delete(AuthSession).where(eq(AuthSession.id, sessionId));
}

export type SessionValidationResult =
	| { session: AuthSessionType | null }

export function setSessionTokenCookie(cookies: AstroCookies, token: string, expiresAt: Date): void {
    cookies.set("session", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: import.meta.env.PROD,
        expires: expiresAt,
        path: "/"
    });
}

export function deleteSessionTokenCookie(cookies: AstroCookies): void {
    cookies.set("session", "", {
        httpOnly: true,
        sameSite: "lax",
        secure: import.meta.env.PROD,
        maxAge: 0,
        path: "/"
    });
}