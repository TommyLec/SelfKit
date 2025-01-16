import { get2FARedirect } from '$lib/server/auth/2fa';
import { verifyEmailInput, checkEmailAvailability } from '$lib/server/auth/email';
import {
	createEmailVerificationRequest,
	sendVerificationEmail,
	setEmailVerificationRequestCookie
} from '$lib/server/auth/email-verification';
import { verifyPasswordStrength } from '$lib/server/auth/password';
import { RefillingTokenBucket } from '$lib/server/auth/rate-limit';
import {
	type SessionFlags,
	generateSessionToken,
	createSession,
	setSessionTokenCookie
} from '$lib/server/auth/session';
import { createUser } from '$lib/server/auth/user';
import { fail, redirect, type Actions, type RequestEvent } from '@sveltejs/kit';
import type { PageServerLoadEvent } from '../$types';

const ipBucket = new RefillingTokenBucket<string>(3, 10);

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
		pageName: "Create Account",
		description: "Join us by creating your secure account. Get started with our platform and access all features with your personal dashboard"
	};
}

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
			message: 'Please enter your email, and password',
			email: ''
		});
	}
	if (!verifyEmailInput(email)) {
		return fail(400, {
			message: 'Invalid email',
			email
		});
	}
	const emailAvailable = await checkEmailAvailability(email);
	if (!emailAvailable) {
		return fail(400, {
			message: 'Email is already used',
			email
		});
	}
	const strongPassword = await verifyPasswordStrength(password);
	if (!strongPassword) {
		return fail(400, {
			message: 'Weak password',
			email
		});
	}
	if (clientIP !== null && !ipBucket.consume(clientIP, 1)) {
		return fail(429, {
			message: 'Too many requests',
			email
		});
	}
	const user = await createUser(email, password);
	const emailVerificationRequest = await createEmailVerificationRequest(user.id, user.email);
	await sendVerificationEmail(emailVerificationRequest.email, emailVerificationRequest.code);
	setEmailVerificationRequestCookie(event, emailVerificationRequest);

	const sessionFlags: SessionFlags = {
		twoFactorVerified: false
	};
	const sessionToken = generateSessionToken();
	const session = await createSession(sessionToken, user.id, sessionFlags);
	setSessionTokenCookie(event, sessionToken, session.expiresAt);
	throw redirect(302, '/auth/2fa/setup');
}
