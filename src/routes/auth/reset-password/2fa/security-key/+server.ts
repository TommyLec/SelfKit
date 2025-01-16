import {
	validatePasswordResetSessionRequest,
	setPasswordResetSessionAs2FAVerified
} from '$lib/server/auth/password-reset';
import type { RequestEvent } from '@sveltejs/kit';
import { handleAuthentication } from '$lib/server/auth/2faAuthentication';

export async function POST(event: RequestEvent) {
	const { session, user } = await validatePasswordResetSessionRequest(event);
	if (session === null || user === null) {
		return new Response('Not authenticated', {
			status: 401
		});
	}
	if (!session.emailVerified || !user.registeredSecurityKey || session.twoFactorVerified) {
		return new Response('Forbidden', {
			status: 403
		});
	}

	const response = await handleAuthentication(event, 'userSecurityKey');

	if(response instanceof Response) {
		return response;
	}

	await setPasswordResetSessionAs2FAVerified(session.id);
	return new Response(null, {
		status: 204
	});
}
