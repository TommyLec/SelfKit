import { invalidateSession, deleteSessionTokenCookie } from '$lib/server/auth/session';
import { fail, redirect, type Actions } from '@sveltejs/kit';

export const actions: Actions = {
	signout: async (event) => {
		if (event.locals.session === null) {
			return fail(401, {
				message: 'Not authenticated'
			});
		}
		await invalidateSession(event.locals.session.id);
		deleteSessionTokenCookie(event);
		return redirect(302, '/auth/login');
	}
};
