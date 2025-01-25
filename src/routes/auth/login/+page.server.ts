import { get2FARedirect } from '$lib/server/auth/2fa';
import { verifyPasswordHash } from '$lib/server/auth/password';
import { Throttler, RefillingTokenBucket } from '$lib/server/auth/rate-limit';
import {
	type SessionFlags,
	generateSessionToken,
	createSession,
	setSessionTokenCookie
} from '$lib/server/auth/session';
import { getUserFromEmail, getUserPasswordHash } from '$lib/server/auth/user';
import { fail, redirect, type Actions, type RequestEvent } from '@sveltejs/kit';
import type { PageServerLoadEvent } from '../$types';
import { superValidate, setError } from 'sveltekit-superforms';
import { loginSchema } from '$lib/forms/schemas/loginSchema';
import { zod } from 'sveltekit-superforms/adapters';

export async function load(event: PageServerLoadEvent) {
	if (event.locals.session !== null && event.locals.user !== null) {
		if (!event.locals.user.emailVerified) {
			return redirect(302, '/auth/verify-email');
		}
		if (!event.locals.user.registered2FA) {
			return redirect(302, '/auth/2fa/setup');
		}
		if (!event.locals.session.twoFactorVerified) {
			return redirect(302, get2FARedirect(event.locals.user));
		}
		return redirect(302, '/');
	}
	return {
		form: await superValidate(zod(loginSchema)),
		// For meta tags
		pageName: 'Login',
		description: 'Sign in to your account to access your dashboard and manage your settings'
	};
}

const throttler = new Throttler<number>([0, 1, 2, 4, 8, 16, 30, 60, 180, 300]);
const ipBucket = new RefillingTokenBucket<string>(20, 1);

export const actions: Actions = {
	default: action
};

async function action(event: RequestEvent) {
	const form = await superValidate(event, zod(loginSchema));
	if (!form.valid) {
		return fail(400, {
			form
		});
	}

	const clientIP = event.request.headers.get('X-Forwarded-For');
	if (clientIP !== null && !ipBucket.check(clientIP, 1)) {
		return setError(form, 'email', 'Too many requests. Please try again later.');
	}

	const { email, password } = form.data;

	const user = await getUserFromEmail(email);
	if (user === null) {
		return setError(form, 'email', 'Account does not exist.');
	}
	if (clientIP !== null && !ipBucket.consume(clientIP, 1)) {
		return setError(form, 'email', 'Too many requests. Please try again later.');
	}
	if (!throttler.consume(user.id)) {
		return setError(form, 'email', 'Too many requests. Please try again later.');
	}

	const passwordHash = await getUserPasswordHash(user.id);

	if (!passwordHash) {
		return setError(form, 'password', 'Use auth provider instead.');
	}

	const validPassword = await verifyPasswordHash(passwordHash, password);
	if (!validPassword) {
		return setError(form, 'password', 'Invalid password.');
	}
	throttler.reset(user.id);
	const sessionFlags: SessionFlags = {
		twoFactorVerified: false
	};
	const sessionToken = generateSessionToken();
	const session = await createSession(sessionToken, user.id, sessionFlags);
	setSessionTokenCookie(event, sessionToken, session.expiresAt);

	if (!user.emailVerified) {
		return redirect(302, '/auth/verify-email');
	}
	if (!user.registered2FA) {
		return redirect(302, '/auth/2fa/setup');
	}
	return redirect(302, get2FARedirect(user));
}
