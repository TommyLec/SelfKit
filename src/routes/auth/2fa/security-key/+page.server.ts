import { get2FARedirect } from '$lib/server/auth/2fa';
import { getUserSecurityKeyCredentials } from '$lib/server/auth/webauthn';
import { config } from '$lib/selfkit.config';
import { redirect, type RequestEvent } from '@sveltejs/kit';

export async function load(event: RequestEvent) {
	if (!config.enableSecurityKeyAuth) {
		return redirect(302, 'auth/login');
	}

	if (event.locals.session === null || event.locals.user === null) {
		return redirect(302, '/auth/login');
	}

	if (!event.locals.user.emailVerified) {
		return redirect(302, '/auth/verify-email');
	}

	if (event.locals.session.twoFactorVerified) {
		return redirect(302, '/');
	}

	if (!event.locals.user!.registered2FA) {
		return redirect(302, '/');
	}
	if (!event.locals.user!.registeredSecurityKey) {
		return redirect(302, get2FARedirect(event.locals.user!));
	}
	const credentials = await getUserSecurityKeyCredentials(event.locals.user!.id);
	return {
		credentials,
		user: event.locals.user!
	};
}
