import { generateRandomOTP } from './utils';
import { ExpiringTokenBucket } from './rate-limit';
import { encodeBase32LowerCaseNoPadding } from '@oslojs/encoding';

import type { RequestEvent } from '@sveltejs/kit';
import { db } from '../database/client';
import { emailVerificationTable } from '../database/schemas/authSchema';
import { and, eq } from 'drizzle-orm';
import { dev } from '$app/environment';
import { config } from '$lib/selfkit.config';
import { EmailService } from '../email/emailService';

export async function getUserEmailVerificationRequest(
	userId: number,
	id: string
): Promise<EmailVerificationRequest | null> {
	const [row] = await db
		.select()
		.from(emailVerificationTable)
		.where(and(eq(emailVerificationTable.id, id), eq(emailVerificationTable.userId, userId)));

	if (!row) {
		return null;
	}

	return row;
}

export async function createEmailVerificationRequest(
	userId: number,
	email: string
): Promise<EmailVerificationRequest> {
	await deleteUserEmailVerificationRequest(userId);
	const idBytes = new Uint8Array(20);
	crypto.getRandomValues(idBytes);
	const id = encodeBase32LowerCaseNoPadding(idBytes);

	const code = generateRandomOTP();
	const expiresAt = new Date(Date.now() + 1000 * 60 * 10);

	const request: EmailVerificationRequest = {
		id,
		userId,
		code,
		email,
		expiresAt
	};

	await db.insert(emailVerificationTable).values(request);

	return request;
}

export async function deleteUserEmailVerificationRequest(userId: number): Promise<void> {
	await db.delete(emailVerificationTable).where(eq(emailVerificationTable.userId, userId));
}

export async function sendVerificationEmail(email: string, code: string): Promise<void> {
	await EmailService.send({
		from: config.emailNoreply,
		to: email,
		subject: 'Your verification code',
		body: email + '<br>' + 'Your verification code is ' + code
	});
}

export function setEmailVerificationRequestCookie(
	event: RequestEvent,
	request: EmailVerificationRequest
): void {
	event.cookies.set('email_verification', request.id, {
		httpOnly: true,
		path: '/',
		secure: !dev,
		sameSite: 'lax',
		expires: request.expiresAt
	});
}

export function deleteEmailVerificationRequestCookie(event: RequestEvent): void {
	event.cookies.set('email_verification', '', {
		httpOnly: true,
		path: '/',
		secure: !dev,
		sameSite: 'lax',
		maxAge: 0
	});
}

export async function getUserEmailVerificationRequestFromRequest(
	event: RequestEvent
): Promise<EmailVerificationRequest | null> {
	if (event.locals.user === null) {
		return null;
	}
	const id = event.cookies.get('email_verification') ?? null;
	if (!id) {
		return null;
	}
	const request = await getUserEmailVerificationRequest(event.locals.user.id, id);
	if (!request) {
		deleteEmailVerificationRequestCookie(event);
	}
	return request;
}

export const sendVerificationEmailBucket = new ExpiringTokenBucket<number>(3, 60 * 10);

export interface EmailVerificationRequest {
	id: string;
	userId: number;
	code: string;
	email: string;
	expiresAt: Date;
}
