import {
	getUserEmailVerificationRequestFromRequest,
	createEmailVerificationRequest,
	sendVerificationEmail,
	setEmailVerificationRequestCookie,
	deleteUserEmailVerificationRequest,
	deleteEmailVerificationRequestCookie,
	sendVerificationEmailBucket
} from '$lib/server/auth/email-verification';
import { invalidateUserPasswordResetSessions } from '$lib/server/auth/password-reset';
import { ExpiringTokenBucket } from '$lib/server/auth/rate-limit';
import { updateUserEmailAndSetEmailAsVerified } from '$lib/server/auth/user';
import { fail, redirect, type Actions, type RequestEvent } from '@sveltejs/kit';
import { dev } from '$app/environment';

export async function load(event: RequestEvent) {
	if (event.locals.user === null) {
		return redirect(302, '/auth/login');
	}
	let verificationRequest = await getUserEmailVerificationRequestFromRequest(event);
	if (verificationRequest === null || Date.now() >= verificationRequest.expiresAt.getTime()) {
		if (event.locals.user.emailVerified) {
			return redirect(302, '/');
		}
		// Note: We don't need rate limiting since it takes time before requests expire
		verificationRequest = await createEmailVerificationRequest(
			event.locals.user.id,
			event.locals.user.email
		);
		await sendVerificationEmail(verificationRequest.email, verificationRequest.code);
		setEmailVerificationRequestCookie(event, verificationRequest);
	}
	return {
		user: event.locals.user,
		email: verificationRequest.email
	};
}

const bucket = new ExpiringTokenBucket<number>(5, 60 * 30);

export const actions: Actions = {
	verify: verifyCode,
	resend: resendEmail
};

async function verifyCode(event: RequestEvent) {
	if (event.locals.session === null || event.locals.user === null) {
		return fail(401);
	}
	if (event.locals.user.registered2FA && !event.locals.session.twoFactorVerified) {
		return fail(401);
	}
	if (!bucket.check(event.locals.user.id, 1)) {
		return fail(429, {
			verify: {
				message: 'Too many requests'
			}
		});
	}

	let verificationRequest = await getUserEmailVerificationRequestFromRequest(event);
	if (verificationRequest === null) {
		return fail(401);
	}
	const formData = await event.request.formData();
	const code = formData.get('code');
	if (typeof code !== 'string') {
		return fail(400, {
			verify: {
				message: 'Invalid or missing fields'
			}
		});
	}
	if (code === '') {
		return fail(400, {
			verify: {
				message: 'Enter your code'
			}
		});
	}
	if (!bucket.consume(event.locals.user.id, 1)) {
		return fail(400, {
			verify: {
				message: 'Too many requests'
			}
		});
	}
	if (Date.now() >= verificationRequest.expiresAt.getTime()) {
		verificationRequest = await createEmailVerificationRequest(
			verificationRequest.userId,
			verificationRequest.email
		);
		await sendVerificationEmail(verificationRequest.email, verificationRequest.code);
		return {
			verify: {
				message: 'The verification code was expired. We sent another code to your inbox.'
			}
		};
	}
	if (verificationRequest.code !== code) {
		return fail(400, {
			verify: {
				message: 'Incorrect code.'
			}
		});
	}
	await deleteUserEmailVerificationRequest(event.locals.user.id);
	await invalidateUserPasswordResetSessions(event.locals.user.id);
	await updateUserEmailAndSetEmailAsVerified(event.locals.user.id, verificationRequest.email);
	deleteEmailVerificationRequestCookie(event);
	if (!event.locals.user.registered2FA) {
		return redirect(302, '/auth/2fa/setup');
	}
	return redirect(302, '/');
}

async function resendEmail(event: RequestEvent) {
	if (event.locals.session === null || event.locals.user === null) {
		return fail(401, {
			resend: {
				message: 'Not authenticated'
			}
		});
	}
	if (event.locals.user.registered2FA && !event.locals.session.twoFactorVerified) {
		return fail(401, {
			resend: {
				message: 'Forbidden'
			}
		});
	}
	if (!sendVerificationEmailBucket.check(event.locals.user.id, 1)) {
		return fail(429, {
			resend: {
				message: 'Too many requests'
			}
		});
	}
	let verificationRequest = await getUserEmailVerificationRequestFromRequest(event);
	if (verificationRequest === null) {
		if (event.locals.user.emailVerified) {
			return fail(403, {
				resend: {
					message: 'Forbidden'
				}
			});
		}
		if (!sendVerificationEmailBucket.consume(event.locals.user.id, 1)) {
			return fail(429, {
				resend: {
					message: 'Too many requests'
				}
			});
		}
		verificationRequest = await createEmailVerificationRequest(
			event.locals.user.id,
			event.locals.user.email
		);
	} else {
		if (!sendVerificationEmailBucket.consume(event.locals.user.id, 1)) {
			return fail(429, {
				resend: {
					message: 'Too many requests'
				}
			});
		}
		verificationRequest = await createEmailVerificationRequest(
			event.locals.user.id,
			verificationRequest.email
		);
	}

	if (dev) console.log(verificationRequest.code);

	await sendVerificationEmail(verificationRequest.email, verificationRequest.code);
	setEmailVerificationRequestCookie(event, verificationRequest);
	return {
		resend: {
			message: 'A new code was sent to your inbox.'
		}
	};
}
