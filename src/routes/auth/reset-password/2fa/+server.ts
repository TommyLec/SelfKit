import { getPasswordReset2FARedirect } from '$lib/server/auth/2fa';
import { validatePasswordResetSessionRequest } from '$lib/server/auth/password-reset';
import type { RequestEvent } from '@sveltejs/kit';

export async function GET(event: RequestEvent) {
	const { session, user } = await validatePasswordResetSessionRequest(event);
	if (session === null) {
		return new Response(null, {
			status: 302,
			headers: {
				Location: '/auth/login'
			}
		});
	}
	if (!user.registered2FA || session.twoFactorVerified) {
		return new Response(null, {
			status: 302,
			headers: {
				Location: '/auth/reset-password'
			}
		});
	}
	return new Response(null, {
		status: 302,
		headers: {
			Location: getPasswordReset2FARedirect(user)
		}
	});
}
