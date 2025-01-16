import { redirect } from '@sveltejs/kit';
import { generateCodeVerifier, generateState } from 'arctic';

import type { RequestEvent } from '@sveltejs/kit';
import { google } from '$lib/server/auth/providers/google';
import { dev } from '$app/environment';

export async function GET(event: RequestEvent): Promise<Response> {
	const state = generateState();
	const codeVerifier = generateCodeVerifier();

	const url = google.createAuthorizationURL(state, codeVerifier, ['profile', 'email']);

	event.cookies.set('google_state', state, {
		secure: !dev,
		path: '/',
		httpOnly: true,
		maxAge: 60 * 10,
		sameSite: 'lax'
	});

	event.cookies.set('google_code_verifier', codeVerifier, {
		secure: !dev,
		path: '/',
		httpOnly: true,
		maxAge: 60 * 10,
		sameSite: 'lax'
	});

	return redirect(302, url.toString());
}
