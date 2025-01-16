import type { InferSelectModel } from "drizzle-orm";
import { pgTable, boolean, text, timestamp, customType, serial, integer } from "drizzle-orm/pg-core";

const bytea = customType<{ data: Uint8Array; notNull: false; default: false }>({
	dataType() {
	  return "bytea";
	},
  });

export const userTable = pgTable("user", {
	id: serial().primaryKey(),
	extCustomerId: text("ext_customer_id").unique(),
    email: text().notNull().unique(),
	passwordHash: text("password_hash"),
    emailVerified: boolean("email_verified").notNull().default(false),
	recoveryCode: bytea("recovery_code").notNull(),
	created_at: timestamp().defaultNow()
});

export const sessionTable = pgTable("session", {
	id: text().primaryKey(),
	userId: integer("user_id").notNull().references(() => userTable.id),
	twoFactorVerified: boolean("two_factor_verified").notNull().default(false),
	expiresAt: timestamp("expires_at", {
		withTimezone: true,
		mode: "date"
	}).notNull()
});

export const emailVerificationTable = pgTable("email_verification_request", {
	id: text().primaryKey(),
	userId: integer("user_id").notNull().references(() => userTable.id),
	email: text().notNull().unique(),
	code: text().notNull(),
	expiresAt: timestamp("expires_at", {
		withTimezone: true,
		mode: "date"
	}).notNull(),
})

export const passwordResetTable = pgTable("password_reset_session", {
	id: text().primaryKey(),
	userId: integer("user_id").notNull().references(() => userTable.id),
	email: text().notNull().unique(),
	code: text().notNull(),
	emailVerified: boolean("email_verified").notNull().default(false),
	twoFactorVerified: boolean("two_factor_verified").notNull().default(false),
	expiresAt: timestamp("expires_at", {
		withTimezone: true,
		mode: "date"
	}).notNull(),
})

export const totpCredentialTable = pgTable("totp_credential", {
	id: serial().primaryKey(),
	userId: integer("user_id").notNull().references(() => userTable.id),
	key: bytea().notNull()
})

export const passkeyCredentialTable = pgTable("passkey_credential", {
	id: bytea().primaryKey(),
	userId: integer("user_id").notNull().references(() => userTable.id),
	name: text().notNull(),
	algorithm: integer().notNull(),
	publicKey: bytea("public_key").notNull()
})

export const securityKeyCredentialTable = pgTable("security_key_credential", {
	id: bytea().primaryKey(),
	userId: integer("user_id").notNull().references(() => userTable.id),
	name: text().notNull(),
	algorithm: integer().notNull(),
	publicKey: bytea("public_key").notNull()
})

export type UserDB = InferSelectModel<typeof userTable>;
export type Session = InferSelectModel<typeof sessionTable>;
