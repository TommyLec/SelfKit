import { get2FARedirect } from '$lib/server/auth/2fa';
import { verifyEmailInput } from '$lib/server/auth/email';
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

export function load(event: PageServerLoadEvent) {
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
		// For meta tags
		pageName: "Login",
		description: "Sign in to your account to access your dashboard and manage your settings"
	};
}

const throttler = new Throttler<number>([0, 1, 2, 4, 8, 16, 30, 60, 180, 300]);
const ipBucket = new RefillingTokenBucket<string>(20, 1);

export const actions: Actions = {
	default: action
};

async function action(event: RequestEvent) {
	const clientIP = event.request.headers.get('X-Forwarded-For');
	if (clientIP !== null && !ipBucket.check(clientIP, 1)) {
		return fail(429, {
			message: 'Too many requests',
			email: ''
		});
	}

	const formData = await event.request.formData();
	const email = formData.get('email');
	const password = formData.get('password');
	if (typeof email !== 'string' || typeof password !== 'string') {
		return fail(400, {
			message: 'Invalid or missing fields',
			email: ''
		});
	}
	if (email === '' || password === '') {
		return fail(400, {
			message: 'Please enter your email and password.',
			email
		});
	}
	if (!verifyEmailInput(email)) {
		return fail(400, {
			message: 'Invalid email',
			email
		});
	}

	const user = await getUserFromEmail(email);
	if (user === null) {
		return fail(400, {
			message: 'Account does not exist',
			email
		});
	}
	if (clientIP !== null && !ipBucket.consume(clientIP, 1)) {
		return fail(429, {
			message: 'Too many requests',
			email: ''
		});
	}
	if (!throttler.consume(user.id)) {
		return fail(429, {
			message: 'Too many requests',
			email: ''
		});
	}

	const passwordHash = await getUserPasswordHash(user.id);

	if (!passwordHash) {
		return fail(406, {
			message: 'Use auth provider instead',
			email
		});
	}

	const validPassword = await verifyPasswordHash(passwordHash, password);
	if (!validPassword) {
		return fail(400, {
			message: 'Invalid password',
			email
		});
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
