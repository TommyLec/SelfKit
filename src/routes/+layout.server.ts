import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals: { user, session, subscriptions } }) => {
	return {
        user,
		session,
		subscriptions
	};
};