import { deleteSessionTokenCookie, setSessionTokenCookie, validateSessionToken } from "./auth/session";
import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware(async (context, next) => {
	const token = context.cookies.get("session")?.value ?? null;
	if (token === null) {
		context.locals.session = null;
		return next();
	}

	const { session } = await validateSessionToken(token);
	if (session !== null) {
		setSessionTokenCookie(context.cookies, token, session.expiresAt);
	} else {
		deleteSessionTokenCookie(context.cookies);
	}

	context.locals.session = session;
	return next();
});