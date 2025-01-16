import type { RequestEvent } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import {
	Environment,
	EventName,
	LogLevel,
	Paddle,
	SubscriptionCanceledEvent,
	SubscriptionCreatedEvent,
	SubscriptionItemNotification,
	SubscriptionPastDueEvent,
	SubscriptionPausedEvent,
	SubscriptionUpdatedEvent,
	type SubscriptionItemStatus,
	type SubscriptionStatus
} from '@paddle/paddle-node-sdk';
import { db } from '$lib/server/database/client';
import { eq, and, inArray } from 'drizzle-orm';
import {
	subscriptionTable,
	type Subscription
} from '$lib/server/database/schemas/subscriptionSchema';
import {
	productVariantTable,
	type ProductVariant
} from '$lib/server/database/schemas/productsSchema';
import { userTable } from '$lib/server/database/schemas/authSchema';
import { dev } from '$app/environment';
import { EmailService } from '$lib/server/email/emailService';

const paddle = new Paddle(env.PADDLE_API_KEY, {
	environment: dev ? Environment.sandbox : Environment.production,
	logLevel: dev ? LogLevel.verbose : LogLevel.error
});

/**
 * Webhook for paddle event handling. You should set up what event paddle should send inside your Paddle dashboard > Developer Tools > Notifications
 * More information here :  https://developer.paddle.com/webhooks/overview
 *
 * The webhook follow this workflow :
 * 1. Check if the event is a :
 *      - SubscriptionCreated (i.e. the subscription has been created and process in paddle, at this point we can enable access for the user)
 *      - SubscriptionUpdated (i.e. the subscription status will changed to active/paused/past_due/canceled in paddle)
 * 		- SubscriptionPaused (i.e. the subscription changed to paused)
 * 		- SubscriptionCanceled (i.e. the subscription changed to canceled)
 * 		- SubscriptionPastDue (i.e. the subscription changed to past due)
 *
 * By default, each event will trigger the handleSubscriptionEvent function, but you can create your own implementation by changing which function to use for each event (l.100)
 *
 * 2. For each item in a subscription (i.e. you have additional item for a subscription like addon or additional services):
 *  - Check if the update date of the subscription is before the event occurred_at attribute (if not, we do nothing, the subscription is already updated)
 *  - If the subscription does not exist, we create it (a subscription represent one item, that's mean you can have multiple item for the same subscription)
 *
 * Note : We use the same method for the events SubscriptionCreated and SubscriptionUpdated because paddle not guarantee the event order.
 * So for SubscriptionCreated it's possible that the function perform unnecessary DB call.
 * This should not impact performance, however you can modify or create another function if you want to change this behavior, but keep in mind the fact that event is sent in random order by paddle.
 *
 * @param event paddle event
 * @returns Response 200, if not, paddle will call this endpoint again (see https://developer.paddle.com/webhooks/respond-to-webhooks#handle-retries)
 */
export async function POST(event: RequestEvent): Promise<Response> {
	const signature = event.request.headers.get('paddle-signature') || '';
	const rawRequestBody = await event.request.text();

	try {
		if (signature && rawRequestBody) {
			const eventData = paddle.webhooks.unmarshal(
				rawRequestBody,
				env.PADDLE_SUBSCRIPTION_WEBHOOK_KEY,
				signature
			);
			switch (eventData?.eventType) {
				case EventName.SubscriptionCreated:
					onSubscriptionCreated(eventData);
					break;
				case EventName.SubscriptionUpdated:
					onSubscriptionUpdated(eventData);
					break;
				case EventName.SubscriptionPaused:
					onSubscriptionPaused(eventData);
					break;
				case EventName.SubscriptionCanceled:
					onSubscriptionCanceled(eventData);
					break;
				case EventName.SubscriptionPastDue:
					onSubscriptionPastDue(eventData);
					break;
				default:
					console.log('Unknown event triggered : ' + eventData?.eventType);
					break;
			}
		} else {
			console.error('Signature missing in header');
		}
	} catch (e) {
		console.error(e);
	}

	return new Response(null, {
		status: 200
	});
}

const onSubscriptionCreated = handleSubscriptionEvent;
const onSubscriptionUpdated = handleSubscriptionEvent;
const onSubscriptionPaused = handleSubscriptionEvent;
const onSubscriptionCanceled = handleSubscriptionEvent;
const onSubscriptionPastDue = handleSubscriptionEvent;

type Events =
	| SubscriptionCreatedEvent
	| SubscriptionUpdatedEvent
	| SubscriptionPausedEvent
	| SubscriptionCanceledEvent
	| SubscriptionPastDueEvent;

async function handleSubscriptionEvent(event: Events) {
	const id = event.data.customerId;

	if (!id) {
		console.error('Customer ID not found');
		return;
	}

	const customer = await paddle.customers.get(id);

	if (customer.marketingConsent) {
		await EmailService.track('Product purchase', customer.email, true);
	}

	const [user] = await db
		.selectDistinct()
		.from(userTable)
		.where(eq(userTable.email, customer.email));

	if (!user) {
		console.error(`User associated to customerId ${id} not found`);
		return;
	}

	event.data.items.forEach(async (subscriptionItem) => {
		if (!subscriptionItem.price) return;

		const [productVariant] = await db
			.selectDistinct()
			.from(productVariantTable)
			.where(eq(productVariantTable.extVariantId, subscriptionItem.price.id));
		const [subscription] = await db
			.selectDistinct()
			.from(subscriptionTable)
			.where(
				and(
					eq(subscriptionTable.userId, user.id),
					eq(subscriptionTable.productVariantId, productVariant.id)
				)
			);

		if (isAlreadyUpdate(subscription, event.occurredAt)) {
			return;
		}

		if (subscription) {
			updateSubscription(
				user.id,
				productVariant.id,
				event.data.startedAt,
				event.occurredAt,
				subscriptionItem,
				event.data.status
			);
		} else {
			createSubscription(
				user.id,
				event.data.customerId,
				event.data.id,
				productVariant,
				event.data.startedAt,
				event.occurredAt,
				subscriptionItem
			);
		}
	});
}

function isAlreadyUpdate(subscription: Subscription, occurredAt: string) {
	return subscription && subscription.updatedAt && subscription.updatedAt > new Date(occurredAt);
}

async function updateSubscription(
	userId: number,
	variantId: number,
	startDate: string | null,
	occurredAt: string,
	data: SubscriptionItemNotification,
	subscriptionStatus: SubscriptionStatus
) {
	await db
		.update(subscriptionTable)
		.set({
			status: getStatus(subscriptionStatus, data.status),
			startDate: startDate ? new Date(startDate) : undefined,
			endDate: data.nextBilledAt ? new Date(data.nextBilledAt) : null, //If endDate is null -> the subscription is paused or canceled
			updatedAt: new Date(occurredAt)
		})
		.where(
			and(eq(subscriptionTable.userId, userId), eq(subscriptionTable.productVariantId, variantId))
		);
}

async function createSubscription(
	userId: number,
	customerId: string,
	subscriptionId: string,
	variant: ProductVariant,
	startDate: string | null,
	occurredAt: string,
	data: SubscriptionItemNotification
) {
	await deleteDuplicateSubscription(userId, variant.productId);
	await addCustomerIdToUser(userId, customerId);

	await db.insert(subscriptionTable).values({
		userId: userId,
		productVariantId: variant.id,
		subscriptionId: subscriptionId,
		status: 'active',
		startDate: startDate ? new Date(startDate) : new Date(),
		endDate: new Date(data.nextBilledAt!),
		updatedAt: new Date(occurredAt)
	});
}

/**
 * Delete duplicate subscription associate to a product.
 * This operation is mandatory in case the user want to change the billing period (i.e. monthly to annually) of a subscription
 * Paddle handle this like a new subscription instead of update it, so we need to delete the previous one
 *
 * @param userId
 * @param productId
 */
async function deleteDuplicateSubscription(userId: number, productId: number) {
	const variantsIds = await db
		.select({ id: productVariantTable.id })
		.from(productVariantTable)
		.where(eq(productVariantTable.productId, productId));

	await db.delete(subscriptionTable).where(
		and(
			eq(subscriptionTable.userId, userId),
			inArray(
				subscriptionTable.productVariantId,
				variantsIds.map((v) => v.id)
			)
		)
	);
}

async function addCustomerIdToUser(userId: number, customerId: string) {
	await db
		.update(userTable)
		.set({
			extCustomerId: customerId
		})
		.where(eq(userTable.id, userId));
}

/**
 * Return the proper status to put in the DB.
 * If the subscription status is not 'active', all item related take the same status, else the itemStatus is used.
 * @param subscriptionStatus
 * @param itemStatus
 * @returns the proper status
 */
function getStatus(subscriptionStatus: SubscriptionStatus, itemStatus: SubscriptionItemStatus) {
	if (subscriptionStatus !== 'active') return subscriptionStatus;
	if (itemStatus === 'inactive') return 'canceled';
	else return itemStatus;
}
