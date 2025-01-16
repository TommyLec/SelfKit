import { OAuth2RequestError } from 'arctic';
import { decodeIdToken } from 'arctic/dist/oidc';

import type { RequestEvent } from '@sveltejs/kit';
import { db } from '$lib/server/database/client';
import { eq } from 'drizzle-orm';
import { userTable } from '$lib/server/database/schemas/authSchema';
import {
	createSession,
	generateSessionToken,
	setSessionTokenCookie
} from '$lib/server/auth/session';
import { createUserFromProvider } from '$lib/server/auth/user';
import { ObjectParser } from '@pilcrowjs/object-parser';
import { google } from '$lib/server/auth/providers/google';

export async function GET(event: RequestEvent): Promise<Response> {
	const storedState = event.cookies.get('google_state') ?? null;
	const codeVerifier = event.cookies.get('google_code_verifier') ?? null;
	const code = event.url.searchParams.get('code');
	const state = event.url.searchParams.get('state');

	if (storedState === null || codeVerifier === null || code === null || state === null) {
		return new Response('Please restart the process.', {
			status: 400
		});
	}
	if (storedState !== state) {
		return new Response('State not good', {
			status: 400
		});
	}

	try {
		const tokens = await google.validateAuthorizationCode(code, codeVerifier);

		const claims = decodeIdToken(tokens.idToken());
		const claimsParser = new ObjectParser(claims);

		const email = claimsParser.getString('email');

		const [existingUser] = await db.select().from(userTable).where(eq(userTable.email, email));

		const userId = existingUser ? existingUser.id : await createUserFromProvider(email);

		const sessionToken = generateSessionToken();
		const session = await createSession(sessionToken, userId, { twoFactorVerified: false });
		setSessionTokenCookie(event, sessionToken, session.expiresAt);

		return new Response(null, {
			status: 302,
			headers: {
				Location: '/app'
			}
		});
	} catch (e) {
		console.error(e);
		if (e instanceof OAuth2RequestError) {
			return new Response(null, {
				status: 400
			});
		}
		return new Response(null, {
			status: 500
		});
	}
}
