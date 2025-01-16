import { and, eq, sql } from "drizzle-orm";
import { db } from "../database/client";
import { passkeyCredentialTable, securityKeyCredentialTable, totpCredentialTable, userTable } from "../database/schemas/authSchema";
import { addUser, addUserFromProvider } from "../database/userService";
import { decryptToString, encryptString } from "./encryption";
import { hashPassword } from "./password";
import { generateRandomRecoveryCode } from "./utils";

export async function createUser(email: string, password: string): Promise<User> {
	const passwordHash = await hashPassword(password);
	const recoveryCode = generateRandomRecoveryCode();
	const encryptedRecoveryCode = encryptString(recoveryCode);

	const newUser = await addUser(email, passwordHash, encryptedRecoveryCode);
	if (!newUser) {
		throw new Error("Unexpected error");
	}
	const user: User = {
		id: newUser.id,
		email,
		emailVerified: false,
		useProvider: newUser.passwordHash ? false : true,
		registeredTOTP: false,
		registeredPasskey: false,
		registeredSecurityKey: false,
		registered2FA: false
	};
	return user;
}

export async function createUserFromProvider(email: string): Promise<number> {
	const recoveryCode = generateRandomRecoveryCode();
	const encryptedRecoveryCode = encryptString(recoveryCode);

	const newUser = await addUserFromProvider(email, encryptedRecoveryCode);
	if (!newUser) {
		throw new Error("Unexpected error");
	}

	return newUser.id;
}

export async function updateUserPassword(userId: number, password: string): Promise<void> {
	const passwordHash = await hashPassword(password);
	await db.update(userTable).set({ passwordHash }).where(eq(userTable.id, userId))
}

export async function updateUserEmailAndSetEmailAsVerified(userId: number, email: string): Promise<void> {
	await db.update(userTable).set({ email, emailVerified: true}).where(eq(userTable.id, userId));
}

export async function setUserAsEmailVerifiedIfEmailMatches(userId: number, email: string): Promise<boolean> {
	const result =  await db.update(userTable).set({ emailVerified: true }).where(and(eq(userTable.id, userId), eq(userTable.email, email))).returning({ id: userTable.id })

	return result.length > 0;
}

export async function getUserPasswordHash(userId: number): Promise<string | null> {
	const [response] = await db.select({ passwordHash: userTable.passwordHash }).from(userTable).where(eq(userTable.id, userId));

	if (!response) {
		throw new Error("Invalid user ID");
	}
	return response.passwordHash;
}

export async function getUserRecoverCode(userId: number): Promise<string> {
	const [response] = await db.select({ recoveryCode: userTable.recoveryCode }).from(userTable).where(eq(userTable.id, userId));

	if (!response) {
		throw new Error("Invalid user ID");
	}
	return decryptToString(response.recoveryCode);
}

export async function resetUserRecoveryCode(userId: number): Promise<string> {
	const recoveryCode = generateRandomRecoveryCode();
	const encrypted = encryptString(recoveryCode);

	await db.update(userTable).set({ recoveryCode: encrypted }).where(eq(userTable.id, userId));

	return recoveryCode;
}

export async function getUserFromEmail(email: string): Promise<User | null> {
	const [response] = await db
    .select({
      id: userTable.id,
      email: userTable.email,
      emailVerified: userTable.emailVerified,
	  passwordHash: userTable.passwordHash,
      hasTOTP: sql<number>`CASE WHEN totp_credential.id IS NOT NULL THEN 1 ELSE 0 END`,
      hasPasskey: sql<number>`CASE WHEN passkey_credential.id IS NOT NULL THEN 1 ELSE 0 END`,
      hasSecurityKey: sql<number>`CASE WHEN security_key_credential.id IS NOT NULL THEN 1 ELSE 0 END`
    })
    .from(userTable)
    .leftJoin(totpCredentialTable, eq(userTable.id, totpCredentialTable.userId))
    .leftJoin(passkeyCredentialTable, eq(userTable.id, passkeyCredentialTable.userId))
    .leftJoin(securityKeyCredentialTable, eq(userTable.id, securityKeyCredentialTable.userId))
    .where(eq(userTable.email, email));

	if (!response) return null;

	const user: User = {
		id: response.id,
		email: response.email,
		emailVerified: response.emailVerified,
		useProvider: response.passwordHash ? false : true,
		registeredTOTP: Boolean(response.hasTOTP),
		registeredPasskey: Boolean(response.hasPasskey),
		registeredSecurityKey: Boolean(response.hasSecurityKey),
		registered2FA: false
	  };
	if (user.registeredPasskey || user.registeredSecurityKey || user.registeredTOTP) {
		user.registered2FA = true;
	}
	return user;
}

export interface User {
	id: number;
	email: string;
	emailVerified: boolean;
	useProvider: boolean;
	registeredTOTP: boolean;
	registeredSecurityKey: boolean;
	registeredPasskey: boolean;
	registered2FA: boolean;
	extCustomerId?: string
}
