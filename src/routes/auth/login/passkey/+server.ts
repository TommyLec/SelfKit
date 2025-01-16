import {
	type SessionFlags,
	generateSessionToken,
	createSession,
	setSessionTokenCookie
} from '$lib/server/auth/session';
import type { RequestEvent } from '@sveltejs/kit';
import { handleAuthentication } from '$lib/server/auth/2faAuthentication';

// Stricter rate limiting can be omitted here since creating challenges are rate-limited
export async function POST(context: RequestEvent): Promise<Response> {
	const response = await handleAuthentication(context, 'passkey');

	if(response instanceof Response) {
		return response;
	}

	const sessionFlags: SessionFlags = {
		twoFactorVerified: true
	};
	const sessionToken = generateSessionToken();
	const session = await createSession(sessionToken, response.userId, sessionFlags);
	setSessionTokenCookie(context, sessionToken, session.expiresAt);
	return new Response(null, {
		status: 204
	});
}
