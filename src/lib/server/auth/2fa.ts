import { generateRandomRecoveryCode } from './utils';
import { ExpiringTokenBucket } from './rate-limit';
import { decryptToString, encryptString } from './encryption';

import type { User } from './user';
import { db } from '../database/client';
import {
	passkeyCredentialTable,
	securityKeyCredentialTable,
	sessionTable,
	totpCredentialTable,
	userTable
} from '../database/schemas/authSchema';
import { and, eq } from 'drizzle-orm';

export const recoveryCodeBucket = new ExpiringTokenBucket<number>(3, 60 * 60);

export async function resetUser2FAWithRecoveryCode(
	userId: number,
	recoveryCode: string
): Promise<boolean> {
	return await db.transaction(async (tx) => {
		const [user] = await tx
			.select({ recoveryCode: userTable.recoveryCode })
			.from(userTable)
			.where(eq(userTable.id, userId));

		if (!user) {
			return false;
		}

		const userRecoveryCode = decryptToString(user.recoveryCode);
		if (recoveryCode !== userRecoveryCode) {
			return false;
		}

		const newRecoveryCode = generateRandomRecoveryCode();
		const encryptedNewRecoveryCode = encryptString(newRecoveryCode);

		const updateResult = await tx
			.update(userTable)
			.set({ recoveryCode: encryptedNewRecoveryCode })
			.where(and(eq(userTable.id, userId), eq(userTable.recoveryCode, user.recoveryCode)))
			.execute();

		if (updateResult.length === 0) {
			return false;
		}
		await tx
			.update(sessionTable)
			.set({ twoFactorVerified: false })
			.where(eq(sessionTable.userId, userId));
		await tx.delete(totpCredentialTable).where(eq(totpCredentialTable.userId, userId));
		await tx.delete(passkeyCredentialTable).where(eq(passkeyCredentialTable.userId, userId));
		await tx
			.delete(securityKeyCredentialTable)
			.where(eq(securityKeyCredentialTable.userId, userId))
			.execute();

		return true;
	});
}

export function get2FARedirect(user: User): string {
	if (user.registeredPasskey) {
		return '/auth/2fa/passkey';
	}
	if (user.registeredSecurityKey) {
		return '/auth/2fa/security-key';
	}
	if (user.registeredTOTP) {
		return '/auth/2fa/totp';
	}
	return '/auth/2fa/setup';
}

export function getPasswordReset2FARedirect(user: User): string {
	if (user.registeredPasskey) {
		return '/auth/reset-password/2fa/passkey';
	}
	if (user.registeredSecurityKey) {
		return '/auth/reset-password/2fa/security-key';
	}
	if (user.registeredTOTP) {
		return '/auth/reset-password/2fa/totp';
	}
	return '/auth/2fa/setup';
}
