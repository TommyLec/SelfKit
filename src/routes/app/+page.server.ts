import { checkAuthorization, checkSubscription } from '$lib/server/auth/serverUtils';

export async function load({ locals }) {
	checkAuthorization(locals);
	checkSubscription(locals.subscriptions)
	return {};
}
