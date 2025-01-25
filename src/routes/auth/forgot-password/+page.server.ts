import { forgotPasswordSchema } from '$lib/forms/schemas/forgotPasswordSchema';
import {
	invalidateUserPasswordResetSessions,
	createPasswordResetSession,
	sendPasswordResetEmail,
	setPasswordResetSessionTokenCookie
} from '$lib/server/auth/password-reset';
import { RefillingTokenBucket } from '$lib/server/auth/rate-limit';
import { generateSessionToken } from '$lib/server/auth/session';
import { getUserFromEmail } from '$lib/server/auth/user';
import { fail, redirect, type Actions, type RequestEvent } from '@sveltejs/kit';
import { setError, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

const ipBucket = new RefillingTokenBucket<string>(3, 60);
const userBucket = new RefillingTokenBucket<number>(3, 60);

export async function load(event: RequestEvent) {
	if (event.locals.user) {
		return redirect(302, '/account');
	}

	return {
		form: await superValidate(zod(forgotPasswordSchema))
	};
}

export const actions: Actions = {
	default: action
};

async function action(event: RequestEvent) {
	const form = await superValidate(event, zod(forgotPasswordSchema));
	if (!form.valid) {
		return fail(400, {
			form
		});
	}

	const clientIP = event.request.headers.get('X-Forwarded-For');
	if (clientIP !== null && !ipBucket.check(clientIP, 1)) {
		return setError(form, 'email', 'Too many requests. Please try again later.');
	}

	const { email } = form.data;

	const user = await getUserFromEmail(email);
	if (user === null) {
		return setError(form, 'email', 'Account does not exist.');
	}
	if (clientIP !== null && !ipBucket.consume(clientIP, 1)) {
		return setError(form, 'email', 'Too many requests. Please try again later.');
	}
	if (!userBucket.consume(user.id, 1)) {
		return setError(form, 'email', 'Too many requests. Please try again later.');
	}

	invalidateUserPasswordResetSessions(user.id);
	const sessionToken = generateSessionToken();
	const session = await createPasswordResetSession(sessionToken, user.id, user.email);
	sendPasswordResetEmail(session.email, session.code);
	setPasswordResetSessionTokenCookie(event, sessionToken, session.expiresAt);

	return redirect(302, '/auth/reset-password/verify-email');
}
