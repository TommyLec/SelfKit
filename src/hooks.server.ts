import { sequence } from '@sveltejs/kit/hooks';

import { type Handle, type HandleServerError } from '@sveltejs/kit';
import { RefillingTokenBucket } from '$lib/server/auth/rate-limit';
import {
	validateSessionToken,
	setSessionTokenCookie,
	deleteSessionTokenCookie
} from '$lib/server/auth/session';
import { db } from '$lib/server/database/client';
import { productVariantTable, productsTable } from '$lib/server/database/schemas/productsSchema';
import { subscriptionTable } from '$lib/server/database/schemas/subscriptionSchema';
import type { SubscriptionDetails } from '$lib/types/subscriptionDetails';
import { eq } from 'drizzle-orm';
import { i18n } from '$lib/i18n.js';

const bucket = new RefillingTokenBucket<string>(100, 1);

const rateLimitHandle: Handle = async ({ event, resolve }) => {
	// Note: Assumes X-Forwarded-For will always be defined.
	const clientIP = event.request.headers.get('X-Forwarded-For');
	if (clientIP === null) {
		return resolve(event);
	}
	let cost: number;
	if (event.request.method === 'GET' || event.request.method === 'OPTIONS') {
		cost = 1;
	} else {
		cost = 3;
	}
	if (!bucket.consume(clientIP, cost)) {
		return new Response('Too many requests', {
			status: 429
		});
	}
	return resolve(event);
};

const authHandle: Handle = async ({ event, resolve }) => {
	const token = event.cookies.get('session') ?? null;
	if (token === null) {
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}

	const { session, user } = await validateSessionToken(token);
	if (session !== null) {
		setSessionTokenCookie(event, token, session.expiresAt);

		const subscriptions: SubscriptionDetails[] = await db
			.select()
			.from(subscriptionTable)
			.where(eq(subscriptionTable.userId, user.id))
			.innerJoin(
				productVariantTable,
				eq(productVariantTable.id, subscriptionTable.productVariantId)
			)
			.innerJoin(productsTable, eq(productsTable.id, productVariantTable.productId));

		event.locals.subscriptions = subscriptions;
	} else {
		deleteSessionTokenCookie(event);
	}

	event.locals.session = session;
	event.locals.user = user;
	return resolve(event);
};

export const handle = sequence(rateLimitHandle, authHandle, i18n.handle());

export const handleError: HandleServerError = async ({ status, message, error }) => {
	const errorId = crypto.randomUUID();

	if (status === 404) new Response('Redirect', { status: 303, headers: { Location: '/' } });

	console.error(status, message, error)

	return {
		code: status,
		message: 'Oops',
		errorId
	};
};
