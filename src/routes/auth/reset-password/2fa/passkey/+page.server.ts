import { validatePasswordResetSessionRequest } from '$lib/server/auth/password-reset';
import { checkRedirectPasswordReset } from '$lib/server/auth/serverUtils';
import { getUserPasskeyCredentials } from '$lib/server/auth/webauthn';
import { config } from '$lib/selfkit.config';
import { redirect, type RequestEvent } from '@sveltejs/kit';

export async function load(event: RequestEvent) {
	if (!config.enablePasskeyAuth) {
		return redirect(302, 'auth/login');
	}
	const { session, user } = await validatePasswordResetSessionRequest(event);

	checkRedirectPasswordReset(user, session, { checkPasskey: true });

	const credentials = await getUserPasskeyCredentials(user!.id);

	return {
		user,
		credentials
	};
}
