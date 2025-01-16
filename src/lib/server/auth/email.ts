import { eq } from "drizzle-orm";
import { userTable } from "../database/schemas/authSchema";
import { db } from "../database/client";

export function verifyEmailInput(email: string): boolean {
	return /^.+@.+\..+$/.test(email) && email.length < 256;
}

export async function checkEmailAvailability(email: string): Promise<boolean> {
	const row = await db.select().from(userTable).where(eq(userTable.email, email));
	return row.length === 0;
}
