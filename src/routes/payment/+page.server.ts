import { redirect, type RequestEvent } from '@sveltejs/kit';
import { config } from '$lib/selfkit.config';
import { getActiveProductsWithVariants } from '$lib/server/database/productService';

export async function load(event: RequestEvent) {
	if (
		event.locals.user &&
		event.locals.subscriptions &&
		event.locals.subscriptions.length > 0 &&
		!config.enableMultiSubscription
	) {
		return redirect(302, '/account');
	}

	const products = await getActiveProductsWithVariants();

	const subscriptions = event.locals.subscriptions;

	return {
		session: event.locals.session,
		products,
		subscriptions,
		// For meta tags
		pageName: 'Pricing',
		description: config.productDescription
	};
}
