import { db } from './client';
import { env } from '$env/dynamic/private';
import mockProductWithVariants from './mockData/mockProductWithVariants';

export type ProductWithVariants = Awaited<ReturnType<typeof getActiveProductsWithVariants>>;

export async function getActiveProductsWithVariants() {
	if (env.USE_MOCK_DATA) {
		return mockProductWithVariants;
	}

	try {
		return await db.query.productsTable.findMany({
			where: (productsTable, { eq }) => eq(productsTable.status, 'active'),
			with: {
				variants: {
					where: (productVariantTable, { eq }) => eq(productVariantTable.status, 'active')
				}
			}
		});
	} catch (error) {
		console.error(error);
		return [];
	}
}
