import { relations, type InferSelectModel } from "drizzle-orm";
import { decimal, integer, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const productsTable = pgTable('product', {
    id: serial().primaryKey(),
    extProductId: varchar("ext_product_id", { length: 255 }).notNull().unique(),
    name: varchar({ length: 255 }).notNull(),
    iconUrl: text(),
    description: text(),
    details: text(),
    status: varchar({
		length: 50,
		enum: ['active', 'inactive']
	}).notNull(),
    createdAt: timestamp("created_at",{
		withTimezone: true,
		mode: "date"
	}).defaultNow().notNull(),
    updatedAt: timestamp("updated_at",{
		withTimezone: true,
		mode: "date"
	}).defaultNow().notNull()
})

export const productsRelations = relations(productsTable, ({ many }) => ({
    variants: many(productVariantTable)
}));

export const productVariantTable = pgTable('product_variant', {
    id: serial().primaryKey(),
    extVariantId: varchar("ext_variant_id", { length: 255 }).notNull().unique(),
    productId: integer("product_id").references(() => productsTable.id).notNull(),
    price: decimal({ precision: 10, scale: 2}).notNull(),
    currency: varchar({ length: 255 }).notNull(),
    billingPeriod: varchar("billing_period", { length: 50, enum: ['monthly', 'annually'] }),
    status: varchar({
		length: 50,
		enum: ['active', 'inactive']
	}).notNull(),
    createdAt: timestamp("created_at",{
		withTimezone: true,
		mode: "date"
	}).defaultNow().notNull(),
    updatedAt: timestamp("updated_at",{
		withTimezone: true,
		mode: "date"
	}).defaultNow().notNull()
})

export const variantsRelations = relations(productVariantTable, ({ one }) => ({
    product: one(productsTable, {
        fields: [productVariantTable.productId],
        references: [productsTable.id]
    })
}))

export type Product = InferSelectModel<typeof productsTable>;
export type ProductVariant = InferSelectModel<typeof productVariantTable>;