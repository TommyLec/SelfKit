import {
	validatePasswordResetSessionRequest,
	setPasswordResetSessionAs2FAVerified
} from '$lib/server/auth/password-reset';
import { checkRedirectPasswordReset } from '$lib/server/auth/serverUtils';
import { totpBucket, getUserTOTPKey } from '$lib/server/auth/totp';
import { config } from '$lib/selfkit.config';
import { verifyTOTP } from '@oslojs/otp';
import { fail, redirect, type Actions, type RequestEvent } from '@sveltejs/kit';

export async function load(event: RequestEvent) {
	if (!config.enableTotpAuth) {
		return redirect(302, 'auth/login');
	}
	const { session, user } = await validatePasswordResetSessionRequest(event);

	checkRedirectPasswordReset(user, session, { checkTOTP: true });

	return {
		user
	};
}

export const actions: Actions = {
	reset: action
};

async function action(event: RequestEvent) {
	const { session, user } = await validatePasswordResetSessionRequest(event);
	if (session === null) {
		return fail(401, {
			message: 'Not authenticated'
		});
	}
	if (!session.emailVerified || !user.registeredTOTP || session.twoFactorVerified) {
		return fail(403, {
			message: 'Forbidden'
		});
	}
	if (!totpBucket.check(session.userId, 1)) {
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
	const totpKey = await getUserTOTPKey(session.userId);
	if (totpKey === null) {
		return fail(403, {
			message: 'Forbidden'
		});
	}
	if (!totpBucket.consume(session.userId, 1)) {
		return fail(429, {
			message: 'Too many requests'
		});
	}
	if (!verifyTOTP(totpKey, 30, 6, code)) {
		return fail(400, {
			message: 'Invalid code'
		});
	}
	totpBucket.reset(session.userId);
	setPasswordResetSessionAs2FAVerified(session.id);
	return redirect(302, '/auth/reset-password');
}
