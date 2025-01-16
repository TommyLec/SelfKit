import { encodeHexLowerCase } from '@oslojs/encoding';
import { generateRandomOTP } from './utils';
import { sha256 } from '@oslojs/crypto/sha2';
import type { RequestEvent } from '@sveltejs/kit';
import type { User } from './user';
import { db } from '../database/client';
import {
	passkeyCredentialTable,
	passwordResetTable,
	securityKeyCredentialTable,
	totpCredentialTable,
	userTable
} from '../database/schemas/authSchema';
import { eq, sql } from 'drizzle-orm';
import { dev } from '$app/environment';
import { config } from '$lib/selfkit.config';
import { EmailService } from '../email/emailService';

export async function createPasswordResetSession(
	token: string,
	userId: number,
	email: string
): Promise<PasswordResetSession> {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const session: PasswordResetSession = {
		id: sessionId,
		userId,
		email,
		expiresAt: new Date(Date.now() + 1000 * 60 * 10),
		code: generateRandomOTP(),
		emailVerified: false,
		twoFactorVerified: false
	};

	await db.insert(passwordResetTable).values({
		id: session.id,
		userId: session.userId,
		email: session.email,
		code: session.code,
		expiresAt: session.expiresAt
	});

	return session;
}

export async function validatePasswordResetSessionToken(
	token: string
): Promise<PasswordResetSessionValidationResult> {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));

	const [result] = await db
		.select({
			// Session fields
			sessionId: passwordResetTable.id,
			userId: passwordResetTable.userId,
			sessionEmail: passwordResetTable.email,
			code: passwordResetTable.code,
			expiresAt: passwordResetTable.expiresAt,
			emailVerified: passwordResetTable.emailVerified,
			twoFactorVerified: passwordResetTable.twoFactorVerified,
			// User fields
			userEmail: userTable.email,
			userEmailVerified: userTable.emailVerified,
			passwordHash: userTable.passwordHash,
			// 2FA fields
			hasTOTP: sql<number>`CASE WHEN totp_credential.id IS NOT NULL THEN 1 ELSE 0 END`,
			hasPasskey: sql<number>`CASE WHEN passkey_credential.id IS NOT NULL THEN 1 ELSE 0 END`,
			hasSecurityKey: sql<number>`CASE WHEN security_key_credential.id IS NOT NULL THEN 1 ELSE 0 END`
		})
		.from(passwordResetTable)
		.innerJoin(userTable, eq(passwordResetTable.userId, userTable.id))
		.leftJoin(totpCredentialTable, eq(userTable.id, totpCredentialTable.userId))
		.leftJoin(passkeyCredentialTable, eq(userTable.id, passkeyCredentialTable.userId))
		.leftJoin(securityKeyCredentialTable, eq(userTable.id, securityKeyCredentialTable.userId))
		.where(eq(passwordResetTable.id, sessionId))
		.limit(1);

	if (!result) {
		return { session: null, user: null };
	}

	const session: PasswordResetSession = {
		id: result.sessionId,
		userId: result.userId,
		email: result.sessionEmail,
		code: result.code,
		expiresAt: new Date(result.expiresAt),
		emailVerified: Boolean(result.emailVerified),
		twoFactorVerified: Boolean(result.twoFactorVerified)
	};

	const user: User = {
		id: result.userId,
		email: result.userEmail,
		emailVerified: Boolean(result.userEmailVerified),
		useProvider: result.passwordHash ? false : true,
		registeredTOTP: Boolean(result.hasTOTP),
		registeredPasskey: Boolean(result.hasPasskey),
		registeredSecurityKey: Boolean(result.hasSecurityKey),
		registered2FA: false
	};

	if (user.registeredPasskey || user.registeredSecurityKey || user.registeredTOTP) {
		user.registered2FA = true;
	}

	if (Date.now() >= session.expiresAt.getTime()) {
		await db.delete(passwordResetTable).where(eq(passwordResetTable.id, session.id));

		return { session: null, user: null };
	}

	return { session, user };
}

export async function setPasswordResetSessionAsEmailVerified(sessionId: string): Promise<void> {
	await db
		.update(passwordResetTable)
		.set({ emailVerified: true })
		.where(eq(passwordResetTable.id, sessionId));
}

export async function setPasswordResetSessionAs2FAVerified(sessionId: string): Promise<void> {
	await db
		.update(passwordResetTable)
		.set({ twoFactorVerified: true })
		.where(eq(passwordResetTable.id, sessionId));
}

export async function invalidateUserPasswordResetSessions(userId: number): Promise<void> {
	await db.delete(passwordResetTable).where(eq(passwordResetTable.userId, userId));
}

export async function validatePasswordResetSessionRequest(
	event: RequestEvent
): Promise<PasswordResetSessionValidationResult> {
	const token = event.cookies.get('password_reset_session') ?? null;
	if (!token) {
		return { session: null, user: null };
	}
	const result = await validatePasswordResetSessionToken(token);
	if (result.session === null) {
		deletePasswordResetSessionTokenCookie(event);
	}
	return result;
}

export function setPasswordResetSessionTokenCookie(
	event: RequestEvent,
	token: string,
	expiresAt: Date
): void {
	event.cookies.set('password_reset_session', token, {
		expires: expiresAt,
		sameSite: 'lax',
		httpOnly: true,
		path: '/',
		secure: !dev
	});
}

export function deletePasswordResetSessionTokenCookie(event: RequestEvent): void {
	event.cookies.set('password_reset_session', '', {
		maxAge: 0,
		sameSite: 'lax',
		httpOnly: true,
		path: '/',
		secure: !dev
	});
}

export async function sendPasswordResetEmail(email: string, code: string): Promise<void> {
	const { error } = await EmailService.send({
		from: config.emailNoreply,
		to: email,
		subject: 'Your reset code',
		body: email + '<br>' + 'Your reset code is ' + code
	});

	if (error) {
		console.error(error);
	}
}

export interface PasswordResetSession {
	id: string;
	userId: number;
	email: string;
	expiresAt: Date;
	code: string;
	emailVerified: boolean;
	twoFactorVerified: boolean;
}

export type PasswordResetSessionValidationResult =
	| { session: PasswordResetSession; user: User }
	| { session: null; user: null };
