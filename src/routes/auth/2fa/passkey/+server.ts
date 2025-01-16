import { handleAuthentication } from '$lib/server/auth/2faAuthentication';
import { setSessionAs2FAVerified } from '$lib/server/auth/session';
import type { RequestEvent } from '@sveltejs/kit';

export async function POST(event: RequestEvent) {
	if (event.locals.session === null || event.locals.user === null) {
		return new Response('Not authenticated', {
			status: 401
		});
	}
	if (
		!event.locals.user.emailVerified ||
		!event.locals.user.registeredPasskey ||
		event.locals.session.twoFactorVerified
	) {
		return new Response('Forbidden', {
			status: 403
		});
	}

	const response = await handleAuthentication(event, 'userPasskey');

	if(response instanceof Response) {
		return response;
	}

	await setSessionAs2FAVerified(event.locals.session.id);
	return new Response(null, {
		status: 204
	});
}