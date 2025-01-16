import { getActiveProductsWithVariants } from '$lib/server/database/productService';
import { config } from '$lib/selfkit.config';
import type { RequestEvent } from '@sveltejs/kit';

export async function load(event: RequestEvent) {
	const products = await getActiveProductsWithVariants();
	return {
		session: event.locals.session,
		products,
		subscriptions: event.locals.subscriptions,
		// For meta tags
		pageName: 'Home',
		description: config.appDescription
	};
}
