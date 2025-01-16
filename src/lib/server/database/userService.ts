import { userTable, type UserDB } from './schemas/authSchema';
import { db } from './client';


export async function addUser(email: string, passwordHash: string, recoveryCode: Uint8Array): Promise<UserDB> {
	const userToCreate = {
		extCustomerId: null,
		email,
		passwordHash,
		recoveryCode,
		emailVerified: false,
		created_at: new Date()
	};
	const [user] = await db.insert(userTable).values(userToCreate).returning();
	return user;
}

export async function addUserFromProvider(email: string, recoveryCode: Uint8Array): Promise<UserDB> {
	const userToCreate = {
		extCustomerId: null,
		email,
		recoveryCode,
		emailVerified: true,
		created_at: new Date()
	};
	const [user] = await db.insert(userTable).values(userToCreate).returning();
	return user;
}