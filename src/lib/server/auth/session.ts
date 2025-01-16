import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";
import type { User } from "./user";
import type { RequestEvent } from "@sveltejs/kit";
import { passkeyCredentialTable, securityKeyCredentialTable, sessionTable, totpCredentialTable, userTable } from "../database/schemas/authSchema";
import { eq } from "drizzle-orm";
import { db } from "../database/client";
import { dev } from "$app/environment";

export async function validateSessionToken(token: string): Promise<SessionValidationResult> {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));

	const [result] = await db
    .select({
      id: sessionTable.id,
      userId: sessionTable.userId,
      expiresAt: sessionTable.expiresAt,
      twoFactorVerified: sessionTable.twoFactorVerified,
      userEmail: userTable.email,
      emailVerified: userTable.emailVerified,
      passwordHash: userTable.passwordHash,
      extCustomerId: userTable.extCustomerId,
      hasTOTP: totpCredentialTable.id,
      hasPasskey: passkeyCredentialTable.id,
      hasSecurityKey: securityKeyCredentialTable.id,
    })
    .from(sessionTable)
    .innerJoin(userTable, eq(sessionTable.userId, userTable.id))
    .leftJoin(totpCredentialTable, eq(sessionTable.userId, totpCredentialTable.userId))
    .leftJoin(passkeyCredentialTable, eq(userTable.id, passkeyCredentialTable.userId))
    .leftJoin(securityKeyCredentialTable, eq(userTable.id, securityKeyCredentialTable.userId))
    .where(eq(sessionTable.id, sessionId))
    .limit(1);

  if (!result) {
    return { session: null, user: null };
  }

  const userObj: User = {
    id: result.userId,
    email: result.userEmail,
    emailVerified: result.emailVerified,
    useProvider: result.passwordHash ? false : true,
    extCustomerId: result.extCustomerId ?? undefined,
    registeredTOTP: result.hasTOTP !== null,
    registeredPasskey: result.hasPasskey !== null,
    registeredSecurityKey: result.hasSecurityKey !== null,
    registered2FA: false
  };

  if (userObj.registeredPasskey || userObj.registeredSecurityKey || userObj.registeredTOTP) {
    userObj.registered2FA = true;
  }

  if (Date.now() >= result.expiresAt.getTime()) {
    await db
      .delete(sessionTable)
      .where(eq(sessionTable.id, sessionId));
    return { session: null, user: null };
  }

  if (Date.now() >= result.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
    const newExpiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
    result.expiresAt = newExpiresAt;
    
    await db
      .update(sessionTable)
      .set({ 
        expiresAt: newExpiresAt
      })
      .where(eq(sessionTable.id, sessionId));
  }

  return { session: result, user: userObj };
}

export async function invalidateSession(sessionId: string): Promise<void> {
	await db.delete(sessionTable).where(eq(sessionTable.id, sessionId));
}

export async function invalidateUserSessions(userId: number): Promise<void> {
	await db.delete(sessionTable).where(eq(sessionTable.userId, userId));
}

export function setSessionTokenCookie(event: RequestEvent, token: string, expiresAt: Date): void {
	event.cookies.set("session", token, {
		httpOnly: true,
		path: "/",
		secure: !dev,
		sameSite: "lax",
		expires: expiresAt
	});
}

export function deleteSessionTokenCookie(event: RequestEvent): void {
	event.cookies.set("session", "", {
		httpOnly: true,
		path: "/",
		secure: !dev,
		sameSite: "lax",
		maxAge: 0
	});
}

export function generateSessionToken(): string {
	const tokenBytes = new Uint8Array(20);
	crypto.getRandomValues(tokenBytes);
	const token = encodeBase32LowerCaseNoPadding(tokenBytes);
	return token;
}

export async function createSession(token: string, userId: number, flags: SessionFlags): Promise<Session> {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const session: Session = {
		id: sessionId,
		userId,
		expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
		twoFactorVerified: flags.twoFactorVerified
	};

	await db.insert(sessionTable).values({ ...session })

	return session;
}

export async function setSessionAs2FAVerified(sessionId: string): Promise<void> {
	await db.update(sessionTable).set({ twoFactorVerified: true }).where(eq(sessionTable.id, sessionId));
}

export interface SessionFlags {
	twoFactorVerified: boolean;
}

export interface Session extends SessionFlags {
	id: string;
	expiresAt: Date;
	userId: number;
}

type SessionValidationResult = { session: Session; user: User } | { session: null; user: null };
