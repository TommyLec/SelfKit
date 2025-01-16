import { integer, pgTable, serial, timestamp, varchar } from 'drizzle-orm/pg-core';
import { productVariantTable } from './productsSchema';
import { userTable } from './authSchema';
import type { InferSelectModel } from 'drizzle-orm';

export const subscriptionTable = pgTable('subscription', {
	id: serial().primaryKey(),
	userId: integer("user_id")
		.references(() => userTable.id)
		.notNull(),
	productVariantId: integer("product_variant_id")
		.references(() => productVariantTable.id)
		.notNull(),
	subscriptionId: varchar("subscription_id", { length: 255 }).notNull(),
	status: varchar({
		length: 50,
		enum: ['active', 'canceled', 'past_due', 'paused', 'trialing']
	}).notNull(),
	startDate: timestamp("start_date", {
		withTimezone: true,
		mode: "date"
	}).notNull(),
	endDate: timestamp("end_date",{
		withTimezone: true,
		mode: "date"
	}),
    createdAt: timestamp("created_at",{
		withTimezone: true,
		mode: "date"
	}).defaultNow().notNull(),
    updatedAt: timestamp("updated_at",{
		withTimezone: true,
		mode: "date"
	}).defaultNow().notNull()
});

export type Subscription = InferSelectModel<typeof subscriptionTable>;