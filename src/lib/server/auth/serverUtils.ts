import { redirect } from '@sveltejs/kit';
import type { PasswordResetSession } from './password-reset';
import type { User } from './user';
import { get2FARedirect, getPasswordReset2FARedirect } from './2fa';
import type { SubscriptionDetails } from '$lib/types/subscriptionDetails';

type Config = {
	checkEmailVerified?: boolean;
	checkRegistered2FA?: boolean;
	checkTwoFactor?: boolean;
};

/**
 * Validates the authorization state of the user based on session and configuration rules.
 * Redirects the user to appropriate routes if the authorization checks fail.
 *
 * @param {App.Locals} locals - The local state containing the `session` and `user` objects.
 * @param {Config} [config={ checkEmailVerified: true, checkRegistered2FA: false, checkTwoFactor: false }] -
 * Configuration options to customize authorization checks.
 * @param {boolean} config.checkEmailVerified - Whether to verify if the user's email is confirmed.
 * @param {boolean} config.checkRegistered2FA - Whether to check if the user has registered two-factor authentication.
 * @param {boolean} config.checkTwoFactor - Whether to enforce two-factor authentication verification.
 *
 * For most cases, do NOT use config parameters. It is primarily intended for authentication-related routes (e.g. email verification).
 *
 * @returns {null} - Returns `null` if all authorization checks pass.
 * @throws {Error} - Redirects the user to the appropriate route based on the validation outcome:
 * - `/auth/login`: If the session or user is `null`.
 * - 2FA setup or verification route: If 2FA is required but not verified.
 * - `/auth/verify-email`: If email verification is required but not completed.
 * - `/auth/2fa/setup`: If 2FA setup is required but not completed.
 * - `/`: If the user is fully authorized and the `checkTwoFactor` condition is met.
 */
export function checkAuthorization(
	locals: App.Locals,
	config: Config = { checkEmailVerified: true, checkRegistered2FA: false, checkTwoFactor: false }
) {
	if (locals.session === null || locals.user === null) {
		return redirect(302, '/auth/login');
	}
	if (locals.user.registered2FA && !locals.session.twoFactorVerified) {
		return redirect(302, get2FARedirect(locals.user));
	}
	if (config.checkEmailVerified && !locals.user.emailVerified) {
		return redirect(302, '/auth/verify-email');
	}
	if (config.checkRegistered2FA && !locals.user.registered2FA) {
		return redirect(302, '/auth/2fa/setup');
	}
	if (config.checkTwoFactor && locals.session.twoFactorVerified) {
		return redirect(302, '/');
	}

	return null;
}

type PasswordResetConfig = {
	checkPasskey?: boolean;
	checkSecurityKey?: boolean;
	checkTOTP?: boolean;
};

/**
 * Handles redirection logic during the password reset process based on the user's session,
 * account state, and provided configuration.
 *
 * @param {User | null} user - The user object, or `null` if no user is authenticated.
 * @param {PasswordResetSession | null} session - The password reset session object, or `null` if no session exists.
 * @param {PasswordResetConfig} [config={ checkPasskey: false, checkSecurityKey: false, checkTOTP: false }] -
 * Configuration options to determine additional checks for password reset.
 * @param {boolean} config.checkPasskey - Whether to check if the user has a registered passkey.
 * @param {boolean} config.checkSecurityKey - Whether to check if the user has a registered security key.
 * @param {boolean} config.checkTOTP - Whether to check if the user has a registered TOTP authenticator.
 *
 * @returns {null} - Returns `null` if no redirection is required.
 * @throws {Error} - Redirects the user to the appropriate route depending on the validation outcome:
 * - `/auth/forgot-password`: If the session or user is `null`.
 * - `/auth/reset-password/verify-email`: If the email is not verified.
 * - `/auth/reset-password`: If two-factor authentication is not registered or has been verified.
 * - 2FA setup page: If additional 2FA is enabled (passkey, security key, or TOTP) but not set.
 */
export function checkRedirectPasswordReset(
	user: User | null,
	session: PasswordResetSession | null,
	config: PasswordResetConfig = { checkPasskey: false, checkSecurityKey: false, checkTOTP: false }
) {
	if (session === null || user === null) {
		return redirect(302, '/auth/forgot-password');
	}
	if (!session.emailVerified) {
		return redirect(302, '/auth/reset-password/verify-email');
	}
	if (!user.registered2FA) {
		return redirect(302, '/auth/reset-password');
	}
	if (session.twoFactorVerified) {
		return redirect(302, '/auth/reset-password');
	}
	if (config.checkPasskey && !user.registeredPasskey) {
		return redirect(302, getPasswordReset2FARedirect(user));
	}
	if (config.checkSecurityKey && !user.registeredSecurityKey) {
		return redirect(302, getPasswordReset2FARedirect(user));
	}
	if (config.checkTOTP && !user.registeredTOTP) {
		return redirect(302, getPasswordReset2FARedirect(user));
	}

	return null;
}

/**
 * Checks if there is an active, paused, or trialing subscription in the given list.
 * If no such subscription is found, redirects the user to the payment page.
 *
 * @param {Array<{ subscription: { status: string } }>} subscriptions -
 * An array of subscription details where each element contains a subscription object with a `status` property.
 *
 * @returns {null} - Returns `null` if a valid subscription is found.
 * @throws {Error} - Redirects the user to `/payment` with a 302 status code if no valid subscription is found.
 */
export function checkSubscription(subscriptions: SubscriptionDetails[]) {
	const result = subscriptions.find(
		(sub) =>
			sub.subscription.status === 'active' ||
			sub.subscription.status === 'paused' ||
			sub.subscription.status === 'trialing'
	);
	if (!result) return redirect(302, '/payment');
	return null;
}
