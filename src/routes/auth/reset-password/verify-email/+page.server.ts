import { getPasswordReset2FARedirect } from '$lib/server/auth/2fa';
import {
	validatePasswordResetSessionRequest,
	setPasswordResetSessionAsEmailVerified
} from '$lib/server/auth/password-reset';
import { ExpiringTokenBucket } from '$lib/server/auth/rate-limit';
import { setUserAsEmailVerifiedIfEmailMatches } from '$lib/server/auth/user';
import { fail, redirect, type Actions, type RequestEvent } from '@sveltejs/kit';

const bucket = new ExpiringTokenBucket<number>(5, 60 * 30);

export async function load(event: RequestEvent) {
	const { session, user } = await validatePasswordResetSessionRequest(event);
	if (session === null) {
		return redirect(302, '/auth/forgot-password');
	}
	if (session.emailVerified) {
		if (!session.twoFactorVerified) {
			return redirect(302, getPasswordReset2FARedirect(user));
		}
		return redirect(302, '/auth/reset-password');
	}
	return {
		email: session.email
	};
}

export const actions: Actions = {
	default: action
};

async function action(event: RequestEvent) {
	const { session, user } = await validatePasswordResetSessionRequest(event);
	if (session === null) {
		return fail(401, {
			message: 'Not authenticated'
		});
	}
	if (session.emailVerified) {
		return fail(403, {
			message: 'Forbidden'
		});
	}
	if (!bucket.check(session.userId, 1)) {
		return fail(429, {
			message: 'Too many requests'
		});
	}

	const formData = await event.request.formData();
	const code = formData.get('code');
	if (typeof code !== 'string') {
		return fail(400, {
			message: 'Invalid or missing fields'
		});
	}
	if (code === '') {
		return fail(400, {
			message: 'Please enter your code'
		});
	}
	if (!bucket.consume(session.userId, 1)) {
		return fail(429, { message: 'Too many requests' });
	}
	if (code !== session.code) {
		return fail(400, {
			message: 'Incorrect code'
		});
	}
	bucket.reset(session.userId);
	await setPasswordResetSessionAsEmailVerified(session.id);
	const emailMatches = await setUserAsEmailVerifiedIfEmailMatches(session.userId, session.email);
	if (!emailMatches) {
		return fail(400, {
			message: 'Please restart the process'
		});
	}
	if (!user.registered2FA) {
		return redirect(302, '/auth/reset-password');
	}
	return redirect(302, getPasswordReset2FARedirect(user));
}
