import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';
import type { User } from '$lib/server/auth/user';
import { db } from '$lib/server/database/client';
import { productVariantTable } from '$lib/server/database/schemas/productsSchema';
import { subscriptionTable } from '$lib/server/database/schemas/subscriptionSchema';
import { config } from '$lib/selfkit.config';
import {
	Paddle,
	Environment,
	LogLevel,
	type UpdateSubscriptionRequestBody
} from '@paddle/paddle-node-sdk';
import { type Actions, fail } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';

const paddle = new Paddle(env.PADDLE_API_KEY, {
	environment: dev ? Environment.sandbox : Environment.production,
	logLevel: dev ? LogLevel.verbose : LogLevel.error
});

export async function load({ locals: { user, subscriptions, session } }) {
	const products = await db.query.productsTable.findMany({
		with: {
			variants: true
		}
	});

	const credits = user!.extCustomerId
		? await paddle.customers.getCreditBalance(user!.extCustomerId)
		: null;
	const credit = credits?.find((data) => data.currencyCode === 'EUR');
	const availableCredit = Number(credit?.balance?.available);

	return {
		products,
		credit: availableCredit ? (availableCredit / 10).toFixed(2) : null,
		subscriptions,
		session
	};
}

export const actions: Actions = {
	pauseSubscription: async ({ request, locals: { user } }) => {
		return await handleSubscriptionAction(request, user, 'pause', 'next_billing_period');
	},
	resumeSubscription: async ({ request, locals: { user } }) => {
		return await handleSubscriptionAction(request, user, 'resume', 'next_billing_period');
	},
	cancelSubscription: async ({ request, locals: { user } }) => {
		return await handleSubscriptionAction(request, user, 'cancel', 'next_billing_period');
	},
	removeScheduledChange: async ({ request, locals: { user } }) => {
		const formData = await request.formData();
		const validation = await processFormAndValidation(formData, user);

		if (!validation.success) return fail(validation.code!);

		try {
			await paddle.subscriptions.update(validation.extSubscriptionId, {
				scheduledChange: null
			});
		} catch (e) {
			console.error('Error during removing scheduled change', e);
			return fail(500, { message: 'Error during removing scheduled change' });
		}
	},
	updateSubscription: async ({ request, locals: { user } }) => {
		const formData = await request.formData();
		const email = String(formData.get('email'));
		const extVariantId = String(formData.get('extVariantId'));
		const mode = String(formData.get('mode')) as 'changePlan' | 'changeBilling';

		if (config.enableMultiSubscription && mode === 'changePlan') {
			return fail(403);
		}

		const validation = await processFormAndValidation(formData, user);

		if (!validation.success) return fail(validation.code!);

		if (user!.email !== email) return fail(403);

		try {
			await paddle.subscriptions.update(
				validation.extSubscriptionId,
				buildUpdateBody(extVariantId)
			);
			return { success: true };
		} catch (e) {
			console.error('Error during the subscription update', e);
			return fail(500, { message: 'Error during the subscription update' });
		}
	},

	previewUpdateSubscription: async ({ request, locals: { user } }) => {
		const formData = await request.formData();

		const productId = Number(formData.get('productId'));
		const newPeriod = String(formData.get('billingPeriod')) as 'monthly' | 'annually';

		const validation = await processFormAndValidation(formData, user);

		if (!validation.success) return fail(validation.code!);

		const [variant] = await db
			.select()
			.from(productVariantTable)
			.where(
				and(
					eq(productVariantTable.productId, productId),
					eq(productVariantTable.billingPeriod, newPeriod)
				)
			);

		if (!variant) return fail(404);

		try {
			const data = await paddle.subscriptions.previewUpdate(
				validation.extSubscriptionId,
				buildUpdateBody(variant.extVariantId)
			);

			return {
				success: true,
				data: {
					variantId: variant.extVariantId,
					...data.updateSummary?.result
				}
			};
		} catch (e) {
			console.error('Error during subscription update preview', e);
			return fail(500, { message: 'Error during subscription update preview' });
		}
	}
};

async function handleSubscriptionAction(
	request: Request,
	user: User | null,
	action: 'pause' | 'resume' | 'cancel',
	effectiveFrom: 'next_billing_period' | 'immediately'
) {
	const formData = await request.formData();
	const validation = await processFormAndValidation(formData, user);

	if (!validation.success) return fail(validation.code!);

	try {
		await paddle.subscriptions[action](validation.extSubscriptionId, { effectiveFrom });
		return { success: true };
	} catch (e) {
		console.error(`Erreur lors de l'action ${action} de l'abonnement`, e);
		return fail(500, { message: `Erreur lors de l'action ${action} de l'abonnement` });
	}
}

function buildUpdateBody(extVariantId: string): UpdateSubscriptionRequestBody {
	return {
		prorationBillingMode: 'prorated_immediately',
		items: [{ priceId: extVariantId, quantity: 1 }]
	};
}

async function validateUserAndSubscription(user: User | null, subscriptionId: number) {
	if (!user) {
		return { success: false, code: 401 };
	}

	const [subExist] = await db
		.select()
		.from(subscriptionTable)
		.where(and(eq(subscriptionTable.userId, user.id), eq(subscriptionTable.id, subscriptionId)));

	if (!subExist) {
		return { success: false, code: 404 };
	}

	return { success: true };
}

async function processFormAndValidation(formData: FormData, user: User | null) {
	const extSubscriptionId = String(formData.get('extSubscriptionId'));
	const subscriptionId = Number(formData.get('subscriptionId'));

	const validation = await validateUserAndSubscription(user, subscriptionId);

	return {
		extSubscriptionId,
		...validation
	};
}
