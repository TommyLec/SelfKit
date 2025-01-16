import { eq } from "drizzle-orm";
import { db } from "../database/client";
import { totpCredentialTable } from "../database/schemas/authSchema";
import { decrypt, encrypt } from "./encryption";
import { ExpiringTokenBucket, RefillingTokenBucket } from "./rate-limit";

export const totpBucket = new ExpiringTokenBucket<number>(5, 60 * 30);
export const totpUpdateBucket = new RefillingTokenBucket<number>(3, 60 * 10);

export async function getUserTOTPKey(userId: number): Promise<Uint8Array | null> {

	const [row] = await db.select({ key: totpCredentialTable.key }).from(totpCredentialTable).where(eq(totpCredentialTable.userId, userId));

	if (!row) {
		throw new Error("Invalid user ID");
	}

	return decrypt(row.key);
}

export async function updateUserTOTPKey(userId: number, key: Uint8Array): Promise<void> {
	const encrypted = encrypt(key);

	await db.transaction(async (tx) => {
		await tx.delete(totpCredentialTable).where(eq(totpCredentialTable.userId, userId));
		await tx.insert(totpCredentialTable).values({
			userId,
			key: encrypted
		})
	})
}

export async function deleteUserTOTPKey(userId: number): Promise<void> {
	await db.delete(totpCredentialTable).where(eq(totpCredentialTable.userId, userId));
}
