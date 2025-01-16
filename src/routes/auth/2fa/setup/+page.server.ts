import { config } from '$lib/selfkit.config';
import { redirect, type RequestEvent } from '@sveltejs/kit';

export async function load(event: RequestEvent) {
	if (!config.enableSecurityKeyAuth && !config.enablePasskeyAuth && !config.enableTotpAuth) {
		return redirect(302, '/auth/login');
	}
	if (event.locals.session === null || event.locals.user === null) {
		return redirect(302, '/auth/login');
	}
	if (!event.locals.user.emailVerified) {
		return redirect(302, '/auth/verify-email');
	}
	if (event.locals.user.registered2FA) {
		return redirect(302, '/');
	}

	return {};
}
