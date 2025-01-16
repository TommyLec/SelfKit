import { encodeHexLowerCase } from "@oslojs/encoding";
import { db } from "../database/client";
import { passkeyCredentialTable, securityKeyCredentialTable } from "../database/schemas/authSchema";
import { and, eq } from "drizzle-orm";

const challengeBucket = new Set<string>();

export function createWebAuthnChallenge(): Uint8Array {
	const challenge = new Uint8Array(20);
	crypto.getRandomValues(challenge);
	const encoded = encodeHexLowerCase(challenge);
	challengeBucket.add(encoded);
	return challenge;
}

export function verifyWebAuthnChallenge(challenge: Uint8Array): boolean {
	const encoded = encodeHexLowerCase(challenge);
	return challengeBucket.delete(encoded);
}

export async function getUserPasskeyCredentials(userId: number): Promise<WebAuthnUserCredential[]> {
	const rows = await db.select().from(passkeyCredentialTable).where(eq(passkeyCredentialTable.userId, userId));

	const credentials: WebAuthnUserCredential[] = [];
	for (const row of rows) {
		const credential: WebAuthnUserCredential = {
			id: row.id,
			userId: row.userId,
			name: row.name,
			algorithmId: row.algorithm,
			publicKey: row.publicKey
		};
		credentials.push(credential);
	}
	return credentials;
}

export async function getPasskeyCredential(credentialId: Uint8Array): Promise<WebAuthnUserCredential | null> {
	const [row] = await db.select().from(passkeyCredentialTable).where(eq(passkeyCredentialTable.id, credentialId));

	if (!row) {
		return null;
	}

	const credential: WebAuthnUserCredential = {
		id: row.id,
		userId: row.userId,
		name: row.name,
		algorithmId: row.algorithm,
		publicKey: row.publicKey
	};
	return credential;
}

export async function getUserPasskeyCredential(userId: number, credentialId: Uint8Array): Promise<WebAuthnUserCredential | null> {
	const [row] = await db.select().from(passkeyCredentialTable).where(and(eq(passkeyCredentialTable.id, credentialId), eq(passkeyCredentialTable.userId, userId)))

	if (!row) {
		return null;
	}
	const credential: WebAuthnUserCredential = {
		id: row.id,
		userId: row.userId,
		name: row.name,
		algorithmId: row.algorithm,
		publicKey: row.publicKey
	};
	return credential;
}

export async function createPasskeyCredential(credential: WebAuthnUserCredential): Promise<void> {
	await db.insert(passkeyCredentialTable).values({
		id: credential.id,
		userId: credential.userId,
		name: credential.name,
		algorithm: credential.algorithmId,
		publicKey: credential.publicKey
	})
}

export async function deleteUserPasskeyCredential(userId: number, credentialId: Uint8Array): Promise<boolean> {
	const result = await db.delete(passkeyCredentialTable).where(and(eq(passkeyCredentialTable.id, credentialId), eq(passkeyCredentialTable.userId, userId)));
	return result.length > 0;
}

export async function getUserSecurityKeyCredentials(userId: number): Promise<WebAuthnUserCredential[]> {
	const rows = await db.select().from(securityKeyCredentialTable).where(eq(securityKeyCredentialTable.userId, userId));

	const credentials: WebAuthnUserCredential[] = [];
	for (const row of rows) {
		const credential: WebAuthnUserCredential = {
			id: row.id,
			userId: row.userId,
			name: row.name,
			algorithmId: row.algorithm,
			publicKey: row.publicKey
		};
		credentials.push(credential);
	}
	return credentials;
}

export async function getUserSecurityKeyCredential(userId: number, credentialId: Uint8Array): Promise<WebAuthnUserCredential | null> {
	const [row] = await db.select().from(securityKeyCredentialTable).where(eq(securityKeyCredentialTable.id, credentialId));

	if (!row) {
		return null;
	}

	const credential: WebAuthnUserCredential = {
		id: row.id,
		userId: row.userId,
		name: row.name,
		algorithmId: row.algorithm,
		publicKey: row.publicKey
	};
	return credential;
}

export async function createSecurityKeyCredential(credential: WebAuthnUserCredential): Promise<void> {
	await db.insert(securityKeyCredentialTable).values({
		id: credential.id,
		userId: credential.userId,
		name: credential.name,
		algorithm: credential.algorithmId,
		publicKey: credential.publicKey
	})
}

export async function deleteUserSecurityKeyCredential(userId: number, credentialId: Uint8Array): Promise<boolean> {
	const result = await db.delete(securityKeyCredentialTable).where(and(eq(securityKeyCredentialTable.id, credentialId), eq(securityKeyCredentialTable.userId, userId)));
	return result.length > 0;
}

export interface WebAuthnUserCredential {
	id: Uint8Array;
	userId: number;
	name: string;
	algorithmId: number;
	publicKey: Uint8Array;
}
