import { db } from "./client";

export type ProductWithVariants = Awaited<ReturnType<typeof getActiveProductsWithVariants>>;

export async function getActiveProductsWithVariants() {
    return await db.query.productsTable.findMany({
        where: (productsTable, { eq }) => (eq(productsTable.status, "active")),
        with: {
            variants: {
                where: (productVariantTable, { eq }) => eq(productVariantTable.status, "active")
            }
        }
    })
}