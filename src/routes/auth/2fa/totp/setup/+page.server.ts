import { createTOTPKeyURI, verifyTOTP } from '@oslojs/otp';
import { fail, redirect, type Actions, type RequestEvent } from '@sveltejs/kit';
import { decodeBase64, encodeBase64 } from '@oslojs/encoding';
import { renderSVG } from 'uqr';
import { get2FARedirect } from '$lib/server/auth/2fa';
import { setSessionAs2FAVerified } from '$lib/server/auth/session';
import { totpUpdateBucket, updateUserTOTPKey } from '$lib/server/auth/totp';
import { checkAuthorization } from '$lib/server/auth/serverUtils';
import { config } from '$lib/selfkit.config';

export async function load(event: RequestEvent) {
	if (!config.enableTotpAuth) {
		return redirect(302, 'auth/login');
	}

	checkAuthorization(event.locals);

	if (event.locals.user!.registered2FA && !event.locals.session!.twoFactorVerified) {
		return redirect(302, get2FARedirect(event.locals.user!));
	}

	const totpKey = new Uint8Array(20);
	crypto.getRandomValues(totpKey);
	const encodedTOTPKey = encodeBase64(totpKey);
	const keyURI = createTOTPKeyURI(config.appName, event.locals.user!.email, totpKey, 30, 6);
	const qrcode = renderSVG(keyURI);
	return {
		encodedTOTPKey,
		qrcode
	};
}

export const actions: Actions = {
	default: action
};

async function action(event: RequestEvent) {
	if (event.locals.session === null || event.locals.user === null) {
		return fail(401, {
			message: 'Not authenticated'
		});
	}
	if (!event.locals.user.emailVerified) {
		return fail(403, {
			message: 'Forbidden'
		});
	}
	if (event.locals.user.registered2FA && !event.locals.session.twoFactorVerified) {
		return fail(403, {
			message: 'Forbidden'
		});
	}
	if (!totpUpdateBucket.check(event.locals.user.id, 1)) {
		return fail(429, {
			message: 'Too many requests'
		});
	}

	const formData = await event.request.formData();
	const encodedKey = formData.get('key');
	const code = formData.get('code');
	if (typeof encodedKey !== 'string' || typeof code !== 'string') {
		return fail(400, {
			message: 'Invalid or missing fields'
		});
	}
	if (code === '') {
		return fail(400, {
			message: 'Please enter your code'
		});
	}
	if (encodedKey.length !== 28) {
		return fail(400, {
			message: 'Please enter your code'
		});
	}
	let key: Uint8Array;
	try {
		key = decodeBase64(encodedKey);
	} catch {
		return fail(400, {
			message: 'Invalid key'
		});
	}
	if (key.byteLength !== 20) {
		return fail(400, {
			message: 'Invalid key'
		});
	}
	if (!totpUpdateBucket.consume(event.locals.user.id, 1)) {
		return fail(429, {
			message: 'Too many requests'
		});
	}
	if (!verifyTOTP(key, 30, 6, code)) {
		return fail(400, {
			message: 'Invalid code'
		});
	}
	updateUserTOTPKey(event.locals.session.userId, key);
	setSessionAs2FAVerified(event.locals.session.id);
	if (!event.locals.user.registered2FA) {
		return redirect(302, '/auth/recovery-code');
	}
	return redirect(302, '/');
}
