import { emailChangeSchema } from '$lib/forms/schemas/emailChangeSchema';
import { passwordChangeSchema } from '$lib/forms/schemas/passwordChangeSchema';
import { get2FARedirect } from '$lib/server/auth/2fa';
import { checkEmailAvailability } from '$lib/server/auth/email';
import {
	sendVerificationEmailBucket,
	createEmailVerificationRequest,
	sendVerificationEmail,
	setEmailVerificationRequestCookie
} from '$lib/server/auth/email-verification';
import { verifyPasswordStrength, verifyPasswordHash } from '$lib/server/auth/password';
import { ExpiringTokenBucket } from '$lib/server/auth/rate-limit';
import { checkApiAuthorization } from '$lib/server/auth/serverUtils';
import {
	invalidateUserSessions,
	generateSessionToken,
	type SessionFlags,
	createSession,
	setSessionTokenCookie
} from '$lib/server/auth/session';
import { totpUpdateBucket, deleteUserTOTPKey } from '$lib/server/auth/totp';
import {
	getUserRecoverCode,
	getUserPasswordHash,
	updateUserPassword,
	resetUserRecoveryCode
} from '$lib/server/auth/user';
import {
	getUserPasskeyCredentials,
	getUserSecurityKeyCredentials,
	deleteUserPasskeyCredential,
	deleteUserSecurityKeyCredential
} from '$lib/server/auth/webauthn';
import { decodeBase64 } from '@oslojs/encoding';
import { type RequestEvent, redirect, type Actions, fail } from '@sveltejs/kit';
import { superValidate, setError } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

const passwordUpdateBucket = new ExpiringTokenBucket<string>(5, 60 * 30);

export async function load(event: RequestEvent) {
	if (event.locals.session === null || event.locals.user === null) {
		return redirect(302, '/auth/login');
	}
	if (event.locals.user.registered2FA && !event.locals.session.twoFactorVerified) {
		return redirect(302, get2FARedirect(event.locals.user));
	}
	let recoveryCode: string | null = null;
	if (event.locals.user.registered2FA) {
		recoveryCode = await getUserRecoverCode(event.locals.user.id);
	}
	const passkeyCredentials = await getUserPasskeyCredentials(event.locals.user.id);
	const securityKeyCredentials = await getUserSecurityKeyCredentials(event.locals.user.id);
	return {
		recoveryCode,
		user: event.locals.user,
		passkeyCredentials,
		securityKeyCredentials,
		emailChangeForm: await superValidate(zod(emailChangeSchema)),
		passwordChangeForm: await superValidate(zod(passwordChangeSchema))
	};
}

export const actions: Actions = {
	update_password: updatePasswordAction,
	update_email: updateEmailAction,
	disconnect_totp: disconnectTOTPAction,
	delete_passkey: deletePasskeyAction,
	delete_security_key: deleteSecurityKeyAction,
	regenerate_recovery_code: regenerateRecoveryCodeAction
};

async function updatePasswordAction(event: RequestEvent) {
	checkApiAuthorization(event.locals);

	const form = await superValidate(event, zod(passwordChangeSchema));
	if (!form.valid) {
		return fail(400, {
			form
		});
	}

	if (!passwordUpdateBucket.check(event.locals.session!.id, 1)) {
		return setError(form, 'confirmPassword', 'Too many requests, try again later.');
	}

	const { currentPassword, newPassword } = form.data;

	const strongPassword = await verifyPasswordStrength(newPassword);
	if (!strongPassword) {
		return setError(form, 'newPassword', 'Weak password.');
	}

	if (!passwordUpdateBucket.consume(event.locals.session!.id, 1)) {
		return setError(form, 'confirmPassword', 'Too many requests, try again later.');
	}

	const passwordHash = await getUserPasswordHash(event.locals.user!.id);

	if (passwordHash) {
		const validPassword = await verifyPasswordHash(passwordHash, currentPassword);
		if (!validPassword) {
			return setError(form, 'currentPassword', 'Incorrect password.');
		}
	}
	passwordUpdateBucket.reset(event.locals.session!.id);
	await invalidateUserSessions(event.locals.user!.id);
	await updateUserPassword(event.locals.user!.id, newPassword);

	const sessionToken = generateSessionToken();
	const sessionFlags: SessionFlags = {
		twoFactorVerified: event.locals.session!.twoFactorVerified
	};
	const session = await createSession(sessionToken, event.locals.user!.id, sessionFlags);
	setSessionTokenCookie(event, sessionToken, session.expiresAt);

	return {
		form
	};
}

async function updateEmailAction(event: RequestEvent) {
	checkApiAuthorization(event.locals);

	const form = await superValidate(event, zod(emailChangeSchema));
	if (!form.valid) {
		return fail(400, {
			form
		});
	}

	if (!sendVerificationEmailBucket.check(event.locals.user!.id, 1)) {
		return setError(form, 'newEmail', 'Too many requests, try again later.');
	}

	const { newEmail } = form.data;

	const emailAvailable = await checkEmailAvailability(newEmail);
	if (!emailAvailable) {
		return setError(form, 'newEmail', 'This email is already used.');
	}
	if (!sendVerificationEmailBucket.consume(event.locals.user!.id, 1)) {
		return setError(form, 'newEmail', 'Too many requests, try again later.');
	}

	const verificationRequest = await createEmailVerificationRequest(event.locals.user!.id, newEmail);
	await sendVerificationEmail(verificationRequest.email, verificationRequest.code);
	setEmailVerificationRequestCookie(event, verificationRequest);

	return redirect(302, '/auth/verify-email');
}

async function disconnectTOTPAction(event: RequestEvent) {
	if (event.locals.session === null || event.locals.user === null) {
		return fail(401);
	}
	if (!event.locals.user.emailVerified) {
		return fail(403);
	}
	if (event.locals.user.registered2FA && !event.locals.session.twoFactorVerified) {
		return fail(403);
	}
	if (!totpUpdateBucket.consume(event.locals.user.id, 1)) {
		return fail(429);
	}
	await deleteUserTOTPKey(event.locals.user.id);
	return {};
}

async function deletePasskeyAction(event: RequestEvent) {
	if (event.locals.session === null || event.locals.user === null) {
		return fail(401);
	}
	if (!event.locals.user.emailVerified) {
		return fail(403);
	}
	if (event.locals.user.registered2FA && !event.locals.session.twoFactorVerified) {
		return fail(403);
	}
	const formData = await event.request.formData();
	const encodedCredentialId = formData.get('credential_id');
	if (typeof encodedCredentialId !== 'string') {
		return fail(400);
	}
	let credentialId: Uint8Array;
	try {
		credentialId = decodeBase64(encodedCredentialId);
	} catch {
		return fail(400);
	}
	const deleted = await deleteUserPasskeyCredential(event.locals.user.id, credentialId);
	if (!deleted) {
		return fail(400);
	}
	return {};
}

async function deleteSecurityKeyAction(event: RequestEvent) {
	if (event.locals.session === null || event.locals.user === null) {
		return fail(401);
	}
	if (!event.locals.user.emailVerified) {
		return fail(403);
	}
	if (event.locals.user.registered2FA && !event.locals.session.twoFactorVerified) {
		return fail(403);
	}
	const formData = await event.request.formData();
	const encodedCredentialId = formData.get('credential_id');
	if (typeof encodedCredentialId !== 'string') {
		return fail(400);
	}
	let credentialId: Uint8Array;
	try {
		credentialId = decodeBase64(encodedCredentialId);
	} catch {
		return fail(400);
	}
	const deleted = await deleteUserSecurityKeyCredential(event.locals.user.id, credentialId);
	if (!deleted) {
		return fail(400);
	}
	return {};
}

async function regenerateRecoveryCodeAction(event: RequestEvent) {
	if (event.locals.session === null || event.locals.user === null) {
		return fail(401);
	}
	if (!event.locals.user.emailVerified) {
		return fail(403);
	}
	if (!event.locals.session.twoFactorVerified) {
		return fail(403);
	}
	await resetUserRecoveryCode(event.locals.session.userId);
	return {};
}
