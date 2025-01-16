import { validatePasswordResetSessionRequest } from '$lib/server/auth/password-reset';
import { checkRedirectPasswordReset } from '$lib/server/auth/serverUtils';
import { getUserSecurityKeyCredentials } from '$lib/server/auth/webauthn';
import { config } from '$lib/selfkit.config';
import { redirect, type RequestEvent } from '@sveltejs/kit';

export async function load(event: RequestEvent) {
	if (!config.enableSecurityKeyAuth) {
		return redirect(302, 'auth/login');
	}
	const { session, user } = await validatePasswordResetSessionRequest(event);

	checkRedirectPasswordReset(user, session, { checkSecurityKey: true });

	const credentials = await getUserSecurityKeyCredentials(user!.id);
	return {
		credentials,
		user
	};
}
