import { env } from "$env/dynamic/private";
import { EventName, Paddle, ProductCreatedEvent, ProductUpdatedEvent, PriceCreatedEvent, PriceUpdatedEvent, type Interval, Environment, LogLevel } from "@paddle/paddle-node-sdk";
import type { RequestEvent } from "../$types";
import { db } from "$lib/server/database/client";
import { productsTable, productVariantTable } from "$lib/server/database/schemas/productsSchema";
import { eq } from "drizzle-orm";
import { dev } from "$app/environment";

const paddle = new Paddle(env.PADDLE_API_KEY, {
	environment: dev ? Environment.sandbox : Environment.production,
	logLevel: dev ? LogLevel.verbose : LogLevel.error
});

export async function POST(event: RequestEvent): Promise<Response> {
    const signature = event.request.headers.get('paddle-signature') || '';
    const rawRequestBody = await event.request.text();
    try{
        if(signature && rawRequestBody) {
            const eventData = paddle.webhooks.unmarshal(rawRequestBody, env.PADDLE_PRODUCTS_WEBHOOK_KEY, signature);

            switch(eventData?.eventType) {
                case EventName.ProductCreated:
                    onProductCreated(eventData);
                    break;
                case EventName.ProductUpdated:
                    onProductUpdated(eventData);
                    break;
                case EventName.PriceCreated:
                    onPriceCreated(eventData);
                    break;
                case EventName.PriceUpdated:
                    onPriceUpdated(eventData);
                    break;
                default:
                    console.log(eventData?.eventType);
                    break;
            }
        }
    } catch(e) {
        console.error(e);
    }

    return new Response(null, {
        status: 200
    });
}

const onProductCreated = handleProductEvent;
const onProductUpdated = handleProductEvent;
const onPriceCreated = handlePriceEvent;
const onPriceUpdated = handlePriceEvent;

type ProductEvents = ProductCreatedEvent | ProductUpdatedEvent;
type PriceEvents = PriceCreatedEvent | PriceUpdatedEvent;

async function handleProductEvent(event: ProductEvents) {
    const [product] = await db.select().from(productsTable).where(eq(productsTable.extProductId, event.data.id));

    if(isEntityUpToDate(event.occurredAt, product)) {
        return;
    }

    await db.insert(productsTable).values({
        extProductId: event.data.id,
        name: event.data.name,
        description: event.data.description,
        status: event.data.status === "active" ? "active" : "inactive",
        createdAt: new Date(event.data.createdAt),
        updatedAt: new Date(event.occurredAt)
    }).onConflictDoUpdate({ target: productsTable.extProductId, set: {
        name: event.data.name,
        description: event.data.description,
        updatedAt: new Date(event.occurredAt),
        status: event.data.status === "active" ? "active" : "inactive",
    }})
}

async function handlePriceEvent(event: PriceEvents) {
    // Paddle price is equivalent to productVariant in our DB
    const [variant] = await db.selectDistinct().from(productVariantTable).where(eq(productVariantTable.extVariantId, event.data.id));
    
    if(isEntityUpToDate(event.occurredAt, variant)) {
        return;
    }

    const [product] = await db.selectDistinct().from(productsTable).where(eq(productsTable.extProductId, event.data.productId));
    let productId = product?.id;

    //In the case the priceCreatedEvent appear before the productCreatedEvent
    if(!product) {
        const paddleProduct = await paddle.products.get(event.data.productId);

        const response: { id: number }[] = await db.insert(productsTable).values({
            extProductId: paddleProduct.id,
            name: paddleProduct.name,
            description: paddleProduct.description,
            status: paddleProduct.status === "active" ? "active" : "inactive",
            createdAt: new Date(paddleProduct.createdAt),
            updatedAt: new Date(event.occurredAt)
        }).returning({ id: productsTable.id})

        productId = response[0].id;
    }

    await db.insert(productVariantTable).values({
        extVariantId: event.data.id,
        productId: productId,
        price: convertPrice(event.data.unitPrice.amount),
        currency: event.data.unitPrice.currencyCode,
        status: event.data.status === "active" ? "active" : "inactive",
        createdAt: event.data.createdAt ? new Date(event.data.createdAt) : new Date(),
        updatedAt: new Date(event.occurredAt),
        billingPeriod: convertInterval(event.data.billingCycle?.interval)
    }).onConflictDoUpdate({ target: productVariantTable.extVariantId, set: {
        price: convertPrice(event.data.unitPrice.amount),
        currency: event.data.unitPrice.currencyCode,
        status: event.data.status === "active" ? "active" : "inactive",
        updatedAt: new Date(event.occurredAt),
        billingPeriod: convertInterval(event.data.billingCycle?.interval)
    }})
}

function convertPrice(amount: string): string {
    const priceNumber = Number(amount);
    return String(priceNumber / 100)
}

function convertInterval(data: Interval | undefined) {
    if(!data) return null;
    if(data === 'year') return 'annually';
    else return 'monthly';
}

function isEntityUpToDate(eventData: string, entity: {updatedAt: Date | null} ): boolean {
    if(!entity) return false;
    return !!entity.updatedAt && Date.parse(eventData) < entity.updatedAt.getTime();
}