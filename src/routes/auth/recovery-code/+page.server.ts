import { checkAuthorization } from '$lib/server/auth/serverUtils';
import { getUserRecoverCode } from '$lib/server/auth/user';
import { type RequestEvent } from '@sveltejs/kit';

export async function load(event: RequestEvent) {
	checkAuthorization(event.locals, { checkRegistered2FA: true });

	const recoveryCode = await getUserRecoverCode(event.locals.user!.id);

	return {
		recoveryCode
	};
}
